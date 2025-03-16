const ejs = require('ejs');
const fs = require('fs');
const { join } = require('path');
const plist = require('plist');
const shell = require('../utils/shell');

const constants = require('../config/constants');
const { preProcessCommands } = require('../utils/processCommand');
const { homedir } = constants;

if (process.platform === constants.platforms.macos) {
    shell
        .exec(`chmod +x '${join(__dirname, './defaultAppExist.sh')}'`)
        .then((modRes) => {
            if (modRes.code != 0) {
                throw new Error(modRes.stderr);
            }
        });
}

const getDefaultApp = async (protocol) => {
    const res = await shell.exec(
        `'${join(__dirname, './defaultAppExist.sh')}' "${protocol}://test"`,
        { silent: true }
    );
    if (res.code !== 0 || res.stderr) {
        throw new Error(res.stderr);
    }
    return res.stdout.trim() !== 'pr-result=false' ? res.stdout.trim() : null;
};

/**
 * Checks if the given protocol already exist on not
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @returns {Promise}
 */
const checkIfExists = async (protocol) => {
    const defaultApp = await getDefaultApp(protocol);

    return defaultApp !== null;
};

/**
 * Registers the given protocol with the given command.
 * @param {object} options - the options
 * @param {string=} options.protocol - Protocol on which it the given command should be called.
 * @param {string=} options.command - Command which will be executed when the above protocol is initiated
 * @param {boolean=} options.override - Command which will be executed when the above protocol is initiated
 * @param {boolean=} options.terminal - If set true then your command will open in new terminal
 * @param {string=} options.appName - Name of the app will be by default it will be ${protocol}.sh
 * @returns {Promise}
 */
const register = async (options) => {
    const { protocol, override, terminal } = options;
    let { command } = options;
    let tempDir = null;

    try {
        const exist = await checkIfExists(protocol);

        if (exist) {
            if (!override) throw new Error('Protocol already exists');
        }

        tempDir = constants.tmpdir(protocol);

        command = await preProcessCommands(protocol, command, options.appName);

        const plistMutator = join(__dirname, 'plistMutator.js');

        const appTemplate = join(__dirname, './templates', 'app.ejs');
        const appSource = join(tempDir, `app-${protocol}.txt`);
        const appPath = join(homedir, protocol, `APP-${protocol}.app`);

        const urlAppTemplate = join(__dirname, './templates', 'url-app.ejs');
        const urlAppSource = join(tempDir, `URL-${protocol}.txt`);
        const urlAppPath = join(homedir, protocol, `URL-${protocol}.app`);

        const scriptTemplate = join(__dirname, './templates', 'script.ejs');
        const scriptFilePath = join(tempDir, 'script.sh');

        const appSourceContent = await new Promise((resolve, reject) => {
            ejs.renderFile(
                appTemplate,
                { command, protocol },
                function (err, str) {
                    if (err) return reject(err);
                    resolve(str);
                }
            );
        });
        if (terminal) fs.writeFileSync(appSource, appSourceContent);

        const urlAppSourceContent = await new Promise((resolve, reject) => {
            ejs.renderFile(
                urlAppTemplate,
                {
                    application: appPath,
                    terminal,
                    command,
                    protocol
                },
                function (err, str) {
                    if (err) return reject(err);
                    resolve(str);
                }
            );
        });
        fs.writeFileSync(urlAppSource, urlAppSourceContent);

        const scriptContent = await new Promise((resolve, reject) => {
            ejs.renderFile(
                scriptTemplate,
                {
                    terminal,
                    appPath,
                    appSource,
                    urlAppPath,
                    urlAppSource,
                    plistMutator,
                    protocol
                },
                function (err, str) {
                    if (err) return reject(err);
                    resolve(str);
                }
            );
        });
        fs.writeFileSync(scriptFilePath, scriptContent);

        const chmod = await shell.exec(`chmod +x '${scriptFilePath}'`);
        if (chmod.code != 0 || chmod.stderr) throw new Error(chmod.stderr);

        const scriptResult = await shell.exec(`'${scriptFilePath}'`, {
            silent: true
        });

        if (scriptResult.code != 0) throw new Error(scriptResult.stderr);
    } finally {
        if (tempDir) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    }
};

/**
 * Removes the registration of the given protocol
 * @param {object?} [options={}] - the options
 * @param {string=} options.protocol - Protocol on which is required to be checked.
 * @param {boolean=} options.force - This will delete the app even if it is not created by this module
 * @returns {Promise}
 */
const deRegister = async ({ protocol, force }) => {
    const defaultApp = await getDefaultApp(protocol);
    if (!defaultApp) return;

    const internalProtocolDir = join(homedir, protocol);
    const plistFile = join(defaultApp, './Contents/Info.plist');
    const appPlist = plist.parse(fs.readFileSync(plistFile).toString());

    const registeredByThisModule = (
        appPlist.CFBundleIdentifier || ''
    ).startsWith('com.protocol.registry');

    if (force || registeredByThisModule) {
        // delete the app
        fs.rmSync(defaultApp, {
            recursive: true,
            force: true
        });
    } else {
        // Remove the protocol registration from the plist
        delete appPlist.CFBundleURLTypes;
        try {
            fs.writeFileSync(plistFile, plist.build(appPlist));
        } catch (e) {
            if (e.code === 'EPERM')
                throw new Error(
                    'Permission Denied. Use force option or get App Management Permissions'
                );
            throw e;
        }
    }

    try {
        // Remove the internal app and script if it is created by this module
        if (registeredByThisModule && fs.existsSync(internalProtocolDir)) {
            fs.rmSync(internalProtocolDir, { recursive: true, force: true });
        }
    } catch (e) {
        console.debug('Ignored Error for deleting intermittent files: ', e);
    }
};

module.exports = {
    checkIfExists,
    register,
    deRegister
};
