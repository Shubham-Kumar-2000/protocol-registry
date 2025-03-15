const Registry = require('winreg');
const fs = require('fs');
const { preProcessCommands } = require('../utils/processCommand');

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
 * Checks if the given protocol already exist on not
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @returns {Promise}
 */
const checkIfExists = (protocol) => {
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
 * @param {string=} options.scriptName - Name of the script file by default it will be ${protocol}.sh
 * @param {function (err)} cb - callback function Optional
 */
const register = async (options) => {
    const { protocol, override, terminal } = options;
    let { command } = options;

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

    const { registry, commandRegistry } = getRegistry(protocol);
    const exist = await checkIfExists(protocol);

    if (exist) {
        if (!override) throw new Error('Protocol already exists');
        await new Promise((resolve, reject) =>
            registry.destroy((err) => {
                if (err) return reject(err);
                return resolve(true);
            })
        );
    }
    command = await preProcessCommands(protocol, command, options.scriptName);

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
};

/**
 * Removes the registration of the given protocol
 * @param {object?} [options={}] - the options
 * @param {string=} options.protocol - Protocol on which is required to be checked.
 * @param {boolean=} options.force - This will delete the app even if it is not created by this module
 * @returns {Promise}
 */
const deRegister = async ({ protocol }) => {
    const { registry } = getRegistry(protocol);
    const exists = await checkIfExists(protocol);
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
    checkIfExists,
    register,
    deRegister
};
