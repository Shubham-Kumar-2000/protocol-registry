'use strict';

const fs = require('fs');
const isWsl = require('is-wsl');

const constants = require('./config/constants');
const linux = require('./linux');
const macos = require('./macos');
const windows = require('./windows');
const {
    registryValidator,
    protocolValidator,
    deRegistryValidator
} = require('./utils/validator');
const { checkIfFolderExists } = require('./utils/linux/fileUtil');
const { preProcessCommands } = require('./utils/processCommand');
const { homedir } = constants;

const getPlatform = () => {
    if (process.platform === constants.platforms.windows || isWsl)
        return windows;
    if (process.platform === constants.platforms.linux) return linux;
    if (process.platform === constants.platforms.macos) return macos;
    throw new Error('Unknown OS');
};

const platform = getPlatform();

/**
 * Registers the given protocol with the given command.
 * @param {string=} protocol - Protocol on which it the given command should be called.
 * @param {string=} command - Command which will be executed when the above protocol is initiated
 * @param {object} options - the options
 * @param {boolean=} options.override - Command which will be executed when the above protocol is initiated
 * @param {boolean=} options.terminal - If set true then your command will open in new terminal
 * @param {string=} options.appName - Name of the app by default it will be `url-${protocol}`
 * @returns {Promise}
 */
const register = async (protocol, command, options = {}) => {
    const validatedOptions = registryValidator(protocol, command, options);

    if (!fs.existsSync(homedir)) {
        fs.mkdirSync(homedir);
    }

    if (!validatedOptions.appName) {
        validatedOptions.appName = `url-${validatedOptions.protocol}`;
    }

    const defaultApp = await platform.getDefaultApp(validatedOptions.protocol);

    if (defaultApp) {
        if (!validatedOptions.override)
            throw new Error('Protocol already exists');
        await platform.deRegister({
            protocol: validatedOptions.protocol,
            force: false,
            defaultApp
        });
    }

    validatedOptions.command = await preProcessCommands(
        validatedOptions.protocol,
        validatedOptions.command
    );

    return platform.register(validatedOptions);
};

/**
 * Checks if the given protocol already exist on not
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @returns {Promise}
 */
const checkIfExists = async (protocol) => {
    return (await platform.getDefaultApp(protocolValidator(protocol))) !== null;
};

/**
 * Fetches the default app for the given protocol
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @returns {Promise}
 */
const getDefaultApp = async (protocol) => {
    return platform.getDefaultApp(protocolValidator(protocol));
};

/**
 * Removes the registration of the given protocol
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @param {object} [options={}] - the options
 * @param {boolean=} options.force - This option has no effect in windows
 * @returns {Promise}
 */
const deRegister = async (protocol, options = {}) => {
    const validatedOptions = deRegistryValidator(protocol, options);

    const defaultApp = await platform.getDefaultApp(validatedOptions.protocol);
    validatedOptions.defaultApp = defaultApp;

    if (!defaultApp) return;

    await platform.deRegister(validatedOptions);

    try {
        if (
            checkIfFolderExists(homedir) &&
            fs.readdirSync(homedir).length == 0
        ) {
            fs.rmSync(homedir, { recursive: true, force: true });
        }
    } catch (e) {
        console.debug(
            `Ignoring Error for deleting empty directory : ${homedir}`,
            e
        );
    }
};

module.exports = {
    register,
    checkIfExists,
    getDefaultApp,
    deRegister
};
