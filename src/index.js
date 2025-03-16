'use strict';

const fs = require('fs');
const isWsl = require('is-wsl');

const constants = require('./config/constants');
const linux = require('./linux');
const macos = require('./macos');
const windows = require('./windows');
const {
    registryValidator,
    checkIfExistsValidator,
    deRegistryValidator
} = require('./utils/validator');
const { checkIfFolderExists } = require('./utils/fileUtil');
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
 * @param {string=} options.appName - Name of the app will be by default it will be ${protocol}.sh
 * @returns {Promise}
 */
const register = async (protocol, command, options = {}) => {
    const validatedOptions = registryValidator(protocol, command, options);

    if (!fs.existsSync(homedir)) {
        fs.mkdirSync(homedir);
    }

    return platform.register(validatedOptions);
};

/**
 * Checks if the given protocol already exist on not
 * @param {string=} protocol - Protocol on which is required to be checked.
 * @returns {Promise}
 */
const checkIfExists = (protocol) => {
    return platform.checkIfExists(checkIfExistsValidator(protocol));
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
    deRegister
};
