/* eslint-disable no-unused-vars */
const ejs = require('ejs');
const fs = require('fs');
const { join } = require('path');
const shell = require('../utils/shell');
const { preProcessCommands } = require('../utils/processCommand');
const constants = require('../config/constants');
const validator = require('../utils/validator');
const { registerSchema, deRegisterSchema } = require('../validation/common');
const {
    checkAndRemoveProtocolSchema,
    checkIfFolderExists,
    checkIfFileExists,
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
const checkifExists = async (protocol) => {
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
 * @param {boolean=} options.script - If set true then your commands will be saved in a script and that script will be executed
 * @param {string=} options.scriptName - Name of the script file by default it will be ${protocol}.sh
 * @param {function (err)} cb - callback function Optional
 */

const register = async (options, cb) => {
    let res = null;
    const validOptions = validator(registerSchema, options);
    const {
        protocol,
        override,
        terminal,
        script: scriptRequired
    } = validOptions;
    let { command } = validOptions;
    if (cb && typeof cb !== 'function')
        throw new Error('Callback is not function');

    let tempDir = null;
    try {
        const exist = await checkifExists(protocol);

        if (exist) {
            if (!override) throw new Error('Protocol already exists');
        }

        tempDir = constants.tmpdir(protocol);

        const desktopFileName = `${protocol}.desktop`;
        const desktopFilePath = join(tempDir, desktopFileName);
        const desktopTemplate = join(__dirname, './templates', 'desktop.ejs');
        const scriptTemplate = join(__dirname, './templates', 'script.ejs');
        const scriptFilePath = join(tempDir, 'script.sh');

        command = await preProcessCommands(
            protocol,
            command,
            scriptRequired,
            options.scriptName
        );

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
    } catch (e) {
        if (!cb) throw e;
        res = e;
    } finally {
        if (tempDir) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    }
    if (cb) return cb(res);
};

/**
 * Removes the registration of the given protocol
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @param {object?} [options={}] - the options
 * @param {boolean=} options.force - This will delete the app even if it is not created by this module
 * @returns {Promise}
 */
const deRegister = async (protocol, options = {}) => {
    const validOptions = validator(deRegisterSchema, options);

    const exist = await checkifExists(protocol);

    if (!exist) {
        return;
    }

    const defaultApp = await getDefaultApp(protocol);

    const configPaths = [
        join(process.env.HOME, '.config', 'mimeapps.list'),
        join(process.env.HOME, '.local/share/applications', 'mimeapps.list')
    ];

    const hasProtocolSchema = checkAndRemoveProtocolSchema(
        configPaths,
        `x-scheme-handler/${protocol}=${defaultApp}`
    );
    if (hasProtocolSchema) {
        const desktopFilePath = join(
            process.env.HOME,
            '.local/share/applications',
            defaultApp
        );
        const desktopFilePaths = [desktopFilePath];

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
        desktopFilePaths.forEach((desktopFilePath) => {
            if (checkIfFileExists(desktopFilePath)) {
                const fileData = fs.readFileSync(desktopFilePath, 'utf-8');
                const registeredByThisModule = fileContainsExactLine(
                    fileData,
                    `PRIdentifier=com.protocol.registry.${protocol}`
                );

                if (registeredByThisModule || validOptions.force) {
                    // delete the desktop app if created by this protocol
                    fs.rmSync(desktopFilePath, {
                        recursive: true,
                        force: true
                    });
                }
            }
        });
    }
};

module.exports = {
    checkifExists,
    register,
    deRegister
};
