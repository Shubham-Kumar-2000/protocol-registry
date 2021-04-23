const Registry = require('winreg');

const validator = require('../utils/validator');
const { registerSchema } = require('../validation/common');

/**
 * Checks if the given protocal already exist on not
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @returns {Promise}
 */
const checkifExists = (protocol) => {
    return new Promise((resolve, reject) => {
        const registry = new Registry({
            hive: Registry.HKCU,
            key: '\\Software\\Classes\\' + protocol
        });
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
 * @param {function (err)} cb - callback function Optional
 */

const register = async (options, cb) => {
    let res = null;
    const { protocol, command, override } = validator(registerSchema, options);
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
        const keyPath = '\\Software\\Classes\\' + protocol;
        const registry = new Registry({
            hive: Registry.HKCU,
            key: keyPath
        });

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

        await new Promise((resolve, reject) =>
            registry.create((err) => {
                if (err) return reject(err);
                return resolve(true);
            })
        );

        const urlDecl = 'URL:' + protocol;
        const cmdPath = keyPath + '\\shell\\open\\command';

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

        const commandRegistry = new Registry({
            hive: Registry.HKCU,
            key: cmdPath
        });

        await new Promise((resolve, reject) =>
            commandRegistry.set(
                Registry.DEFAULT_VALUE,
                Registry.REG_SZ,
                'cmd /c ' + command + ' %1',
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
module.exports = {
    checkifExists,
    register
};
