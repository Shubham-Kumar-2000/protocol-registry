const Registry = require('winreg');
const fs = require('fs');
const ejs = require('ejs');

const { join } = require('path');
const { homedir } = require('../config/constants');
const { setRegistry, processRegistryPath } = require('./registry');

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
 * Fetches the default app for the given protocol
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @returns {Promise}
 */
const getDefaultApp = (protocol) => {
    const { registry } = getRegistry(protocol);
    return new Promise((resolve, reject) => {
        registry.keyExists((err, exist) => {
            if (err) return reject(err);
            if (exist) {
                return resolve(processRegistryPath(registry.path));
            }
            resolve(null);
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
 * @param {string=} options.appName - Name of the app by default it will be `url-${protocol}`
 * @param {function (err)} cb - callback function Optional
 */
const register = async (options) => {
    const { protocol, command, terminal, appName } = options;

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

    const appBatchFileTemplate = join(
        __dirname,
        './templates',
        'app-script.ejs'
    );
    const appBatchFilePath = join(homedir, protocol, `${appName}.bat`);

    const appBatchFileContent = await new Promise((resolve, reject) => {
        ejs.renderFile(
            appBatchFileTemplate,
            {
                terminal,
                command,
                appName
            },
            function (err, str) {
                if (err) return reject(err);
                resolve(str);
            }
        );
    });
    fs.writeFileSync(appBatchFilePath, appBatchFileContent);

    const { registry, commandRegistry } = getRegistry(protocol);

    await new Promise((resolve, reject) =>
        registry.create((err) => {
            if (err) return reject(err);
            return resolve(true);
        })
    );

    await setRegistry(registry, {
        name: 'URL Protocol',
        type: Registry.REG_SZ,
        value: Registry.DEFAULT_VALUE
    });
    await setRegistry(registry, {
        name: Registry.DEFAULT_VALUE,
        type: Registry.REG_SZ,
        value: options.appName
    });

    await setRegistry(commandRegistry, {
        name: Registry.DEFAULT_VALUE,
        type: Registry.REG_SZ,
        value: `"${appBatchFilePath}" "%1"`
    });
};

/**
 * Removes the registration of the given protocol
 * @param {object?} [options={}] - the options
 * @param {string=} options.protocol - Protocol on which is required to be checked.
 * @returns {Promise}
 */
const deRegister = async ({ protocol }) => {
    const { registry } = getRegistry(protocol);

    await new Promise((resolve, reject) => {
        registry.destroy((err) => {
            if (err) return reject(err);
            return resolve();
        });
    });

    const internalProtocolDir = join(homedir, protocol);
    if (fs.existsSync(internalProtocolDir)) {
        fs.rmSync(internalProtocolDir, { recursive: true, force: true });
    }
};

module.exports = {
    getDefaultApp,
    register,
    deRegister
};
