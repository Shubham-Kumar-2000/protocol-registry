const Registry = require('winreg');
const fs = require('fs');
const { preProcessCommands } = require('../utils/processCommand');

const validator = require('../utils/validator');
const { registerSchema, deRegisterSchema } = require('../validation/common');
const { join } = require('path');
const { homedir } = require('../config/constants');

const getRegistry = (protocol) => {
    const keyPath = '\\Software\\Classes\\' + protocol;
    const registry = new Registry({
        hive: Registry.HKCU,
        key: keyPath
    });

    const cmdPath = keyPath + '\\shell\\open\\command';
    const commandRegistry = new Registry({
        hive: Registry.HKCU,
        key: cmdPath
    });

    return { registry, commandRegistry };
};

/**
 * Checks if the given protocal already exist on not
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @returns {Promise}
 */
const checkifExists = (protocol) => {
    const { registry } = getRegistry(protocol);
    return new Promise((resolve, reject) => {
        registry.keyExists((err, exist) => {
            if (err) return reject(err);
            resolve(exist);
        });
    });
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
    // HKEY_CLASSES_ROOT
    //    $PROTOCOL
    //       (Default) = "URL:$NAME"
    //       URL Protocol = ""
    //       shell
    //          open
    //             command
    //                (Default) = "$COMMAND" "%1"
    //
    // However, the "HKEY_CLASSES_ROOT" key can only be written by the
    // Administrator user. So, we instead write to "HKEY_CURRENT_USER\
    // Software\Classes", which is inherited by "HKEY_CLASSES_ROOT"
    // anyway, and can be written by unprivileged users.
    try {
        const { registry, commandRegistry } = getRegistry(protocol);
        const exist = await checkifExists(protocol);

        if (exist) {
            if (!override) throw new Error('Protocol already exists');
            await new Promise((resolve, reject) =>
                registry.destroy((err) => {
                    if (err) return reject(err);
                    return resolve(true);
                })
            );
        }
        command = await preProcessCommands(
            protocol,
            command,
            scriptRequired,
            options.scriptName
        );

        await new Promise((resolve, reject) =>
            registry.create((err) => {
                if (err) return reject(err);
                return resolve(true);
            })
        );

        const urlDecl = 'URL:' + protocol;

        await new Promise((resolve, reject) =>
            registry.set(
                'URL Protocol',
                Registry.REG_SZ,
                Registry.DEFAULT_VALUE,
                (err) => {
                    if (err) return reject(err);
                    return resolve(true);
                }
            )
        );
        await new Promise((resolve, reject) =>
            registry.set(
                Registry.DEFAULT_VALUE,
                Registry.REG_SZ,
                urlDecl,
                (err) => {
                    if (err) return reject(err);
                    return resolve(true);
                }
            )
        );

        await new Promise((resolve, reject) =>
            commandRegistry.set(
                Registry.DEFAULT_VALUE,
                Registry.REG_SZ,
                terminal ? `cmd /k "${command}"` : command,
                (err) => {
                    if (err) return reject(err);
                    return resolve(true);
                }
            )
        );
    } catch (e) {
        if (!cb) throw e;
        res = e;
    }
    if (cb) return cb(res);
};

/**
 * Removes the registration of the given protocol
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @param {object} [options={}] - the options
 * @param {boolean=} options.force - This option has no effect in windows
 * @returns {Promise}
 */
const deRegister = async (protocol, options = {}) => {
    validator(deRegisterSchema, options);
    const { registry } = getRegistry(protocol);
    const exists = await checkifExists(protocol);
    if (!exists) return;

    const internalProtocolDir = join(homedir, protocol);
    if (fs.existsSync(internalProtocolDir)) {
        fs.rmSync(internalProtocolDir, { recursive: true, force: true });
    }

    return new Promise((resolve, reject) => {
        registry.destroy((err) => {
            if (err) return reject(err);
            return resolve();
        });
    });
};

module.exports = {
    checkifExists,
    register,
    deRegister
};
