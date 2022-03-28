const ejs = require('ejs');
const fs = require('fs');
const { join } = require('path');
const shell = require('../utils/shell');
const { preProcessCommands } = require('../utils/processCommand');
const { isRoot } = require('../utils/isRoot');
const validator = require('../utils/validator');
const { registerSchema } = require('../validation/common');
const PermissonDeniedError = require('../errors/permissonDeniedError');

/**
 * Checks if the given protocal already exist on not
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @param {boolean=} allUsers - Check for all users
 * @returns {Promise}
 */
const checkifExists = async (protocol, allUsers) => {
    if (allUsers && !isRoot)
        throw new PermissonDeniedError('Permisson Denied');

    const res = await shell.exec(
        `${
            allUsers ? 'sudo' : ''
        } xdg-mime query default x-scheme-handler/${protocol}`,
        { silent: true },
    );

    if (res.code !== 0 || res.stderr) {
        throw new Error(res.stderr);
    }
    if (res.stdout && res.stdout.length > 0) {
        return true;
    }
    return false;
};

/**
 * Registers the given protocol with the given command.
 * @param {object} options - the options
 * @param {string=} options.protocol - Protocol on which it the given command should be called.
 * @param {string=} options.command - Command which will be executed when the above protocol is initiated
 * @param {boolean=} options.override - Command which will be executed when the above protocol is initiated
 * @param {boolean=} options.terminal - If set true then your command will open in new terminal
 * @param {boolean=} options.script - If set true then your commands will be saved in a script and that script will be executed
 * @param {boolean=} options.allUsers - If set true then your command will be registered for all users
 * @param {function (err)} cb - callback function Optional
 */

const register = async (options, cb) => {
    let res = null;
    const validOptions = validator(registerSchema, options);
    const {
        protocol,
        override,
        terminal,
        script: scriptRequired,
        allUsers,
    } = validOptions;
    let { command } = validOptions;
    if (cb && typeof cb !== 'function')
        throw new Error('Callback is not function');

    try {
        if (allUsers && !isRoot)
            throw new PermissonDeniedError('Permisson Denied');

        const exist = await checkifExists(protocol, allUsers);

        if (exist) {
            if (!override) throw new Error('Protocol already exists');
        }

        const desktopFileName = `${protocol}.desktop`;
        const desktopFilePath = join(__dirname, '../../temp', desktopFileName);
        const desktopTemplate = join(__dirname, './templates', 'desktop.ejs');
        const scriptTemplate = join(__dirname, './templates', 'script.ejs');
        const scriptFilePath = join(__dirname, '../../temp', 'script.sh');

        command = await preProcessCommands(protocol, command, scriptRequired);

        const desktopFileContent = await new Promise((resolve, reject) => {
            ejs.renderFile(
                desktopTemplate,
                { protocol, command, terminal },
                function (err, str) {
                    if (err) return reject(err);
                    resolve(str);
                },
            );
        });
        fs.writeFileSync(desktopFilePath, desktopFileContent);

        const scriptContent = await new Promise((resolve, reject) => {
            ejs.renderFile(
                scriptTemplate,
                { protocol, desktopFileName, desktopFilePath, allUsers },
                function (err, str) {
                    if (err) return reject(err);
                    resolve(str);
                },
            );
        });
        fs.writeFileSync(scriptFilePath, scriptContent);

        const chmod = await shell.exec('chmod +x ' + scriptFilePath);
        if (chmod.code != 0 || chmod.stderr) throw new Error(chmod.stderr);

        const scriptResult = await shell.exec(`'${scriptFilePath}'`, {
            silent: true,
        });
        if (scriptResult.code != 0 || scriptResult.stderr)
            throw new Error(scriptResult.stderr);

        fs.unlinkSync(scriptFilePath);
    } catch (e) {
        if (!cb) throw e;
        res = e;
    }
    if (cb) return cb(res);
};
module.exports = {
    checkifExists,
    register,
};
