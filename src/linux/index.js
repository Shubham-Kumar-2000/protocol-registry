/* eslint-disable no-unused-vars */
const ejs = require('ejs');
const fs = require('fs');
const { join } = require('path');
const shell = require('../utils/shell');
const { preProcessCommands } = require('../utils/processCommand');
const constants = require('../config/constants');
const {
    checkAndRemoveProtocolSchema,
    checkIfFolderExists,
    fileContainsExactLine
} = require('../utils/fileUtil');

const getDefaultApp = async (protocol) => {
    const res = await shell.exec(
        `xdg-mime query default x-scheme-handler/${protocol}`,
        { silent: true }
    );

    /* 
        KDE returns exit code 4 if the protocol is not registered
        see https://cgit.freedesktop.org/xdg/xdg-utils/tree/scripts/xdg-mime.in#n461
    */
    if (
        constants.desktops.current === 'KDE' &&
        res.code === constants.desktops.KDE.noProtoExitCode
    ) {
        return null;
    }

    if (res.code !== 0 || res.stderr) {
        throw new Error(res.stderr);
    }

    if (res.stdout && res.stdout.length > 0) {
        return res.stdout.trim() !== '' ? res.stdout.trim() : null;
    }

    return null;
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
 * @param {string=} options.appName - Name of the app by default it will be `url-${protocol}`
 * @returns {Promise}
 */
const register = async (options) => {
    const { protocol, override, terminal, appName } = options;
    let { command } = options;

    let tempDir = null;
    try {
        const exist = await checkIfExists(protocol);

        if (exist) {
            if (!override) throw new Error('Protocol already exists');
        }

        tempDir = constants.tmpdir(protocol);

        const desktopFileName = appName
            ? `${appName}.desktop`
            : `url-${protocol}.desktop`;
        const desktopFilePath = join(tempDir, desktopFileName);
        const desktopTemplate = join(__dirname, './templates', 'desktop.ejs');
        const scriptTemplate = join(__dirname, './templates', 'script.ejs');
        const scriptFilePath = join(tempDir, 'script.sh');

        command = await preProcessCommands(protocol, command);

        const desktopFileContent = await new Promise((resolve, reject) => {
            ejs.renderFile(
                desktopTemplate,
                { protocol, command, terminal },
                function (err, str) {
                    if (err) return reject(err);
                    resolve(str);
                }
            );
        });
        fs.writeFileSync(desktopFilePath, desktopFileContent);

        const scriptContent = await new Promise((resolve, reject) => {
            ejs.renderFile(
                scriptTemplate,
                { protocol, desktopFileName, desktopFilePath },
                function (err, str) {
                    if (err) return reject(err);
                    resolve(str);
                }
            );
        });
        fs.writeFileSync(scriptFilePath, scriptContent);

        const chmod = await shell.exec(`chmod +x  '${scriptFilePath}'`);
        if (chmod.code != 0 || chmod.stderr) throw new Error(chmod.stderr);

        const scriptResult = await shell.exec(`'${scriptFilePath}'`, {
            silent: true
        });
        if (scriptResult.code != 0 || scriptResult.stderr)
            throw new Error(scriptResult.stderr);
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

    if (!defaultApp) {
        return;
    }
    const configPaths = [
        join(constants.osHomeDir, '.config', 'mimeapps.list'),
        join(constants.osHomeDir, '.local/share/applications', 'mimeapps.list')
    ];

    checkAndRemoveProtocolSchema(
        configPaths,
        `x-scheme-handler/${protocol}=${defaultApp}`
    );

    const desktopFilePaths = [
        join(constants.osHomeDir, '.local/share/applications', defaultApp)
    ];

    const xdgEnv = process.env.XDG_DATA_DIRS;

    if (xdgEnv) {
        const xdgDataDirs = xdgEnv.split(':');
        if (xdgDataDirs && xdgDataDirs.length) {
            xdgDataDirs.forEach((path) => {
                const isApplicationFolderExist = checkIfFolderExists(
                    join(path, 'applications')
                );

                if (isApplicationFolderExist) {
                    desktopFilePaths.push(
                        join(path, 'applications', defaultApp)
                    );
                }
            });
        }
    }

    const desktopFilePath = desktopFilePaths.find(fs.existsSync);

    const fileData = fs.readFileSync(desktopFilePath, 'utf-8');
    const registeredByThisModule = fileContainsExactLine(
        fileData,
        `PRIdentifier=com.protocol.registry.${protocol}`
    );

    if (registeredByThisModule || force) {
        // delete the desktop app if created by this protocol
        fs.rmSync(desktopFilePath, {
            recursive: true,
            force: true
        });
    }

    const internalProtocolDir = join(constants.homedir, protocol);

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
