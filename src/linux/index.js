const ejs = require('ejs');
const fs = require('fs');
const { join } = require('path');
const shell = require('shelljs');

const validator = require('../utils/validator');
const { registerSchema } = require('../validation/common');

/**
 * Checks if the given protocal already exist on not
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @returns {Promise}
 */
const checkifExists = (protocol) => {
    return new Promise((resolve, reject) => {
        const res = shell.exec(
            `xdg-mime query default x-scheme-handler/${protocol}`
        );
        if (res.code !== 0 || res.stderr) {
            return reject(res.stderr);
        }
        if (res.stdout && res.stdout.length > 0) {
            return resolve(true);
        }
        return resolve(false);
    });
};

/**
 * Registers the given protocol with the given command.
 * @param {object} options - the options
 * @param {string=} options.protocol - Protocol on which it the given command should be called.
 * @param {string=} options.command - Command which will be executed when the above protocol is initiated
 * @param {boolean=} options.override - Command which will be executed when the above protocol is initiated
 * @param {function (err)} cb - callback function Optional
 */

const register = async (options, cb) => {
    let res = null;
    const { protocol, command, override } = validator(registerSchema, options);
    if (cb && typeof cb !== 'function')
        throw new Error('Callback is not function');
    try {
        const exist = await checkifExists(protocol);

        if (exist) {
            if (!override) throw new Error('Protocol already exists');
        }

        const desktopFileName = `${protocol}.desktop`;
        const desktopFilePath = join(__dirname, '../../temp', desktopFileName);
        const desktopTemplate = join(__dirname, './templates', 'desktop.ejs');
        const scriptTemplate = join(__dirname, './templates', 'script.ejs');
        const scriptFilePath = join(__dirname, '../../temp', 'script.sh');

        const desktopFileContent = await new Promise((resolve, reject) => {
            ejs.renderFile(
                desktopTemplate,
                { protocol, command, terminal: true },
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

        const chmod = shell.exec('chmod +x ' + scriptFilePath);
        if (chmod.code != 0 || chmod.stderr) throw new Error(chmod.stderr);

        const scriptResult = shell.exec('sudo ' + scriptFilePath);
        if (scriptResult.code != 0 || scriptResult.stderr)
            throw new Error(scriptResult.stderr);
        
        fs.unlinkSync(scriptFilePath)
    } catch (e) {
        if (!cb) throw e;
        res = e;
    }
    if (cb) return cb(res);
};
module.exports = {
    checkifExists,
    register
};
