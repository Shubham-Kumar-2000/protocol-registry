const isWsl = require('is-wsl');
const constants = require('../../src/config/constants');
const linux = require('../platform/linux');
const macos = require('../platform/macos');
const windows = require('../platform/windows');

const validateRegistrationConfig = async (protocol, options) => {
    if (process.platform === constants.platforms.windows || isWsl) {
        windows.validateRegistrationConfiguration(protocol, options);
        return;
    }
    if (process.platform === constants.platforms.macos) {
        macos.validateRegistrationConfiguration(protocol, options);
        return;
    }
    if (process.platform === constants.platforms.linux) {
        linux.validateRegistrationConfiguration(protocol, options);
        return;
    }
    throw new Error('Unknown platform');
};

const validateDeRegistrationConfig = async (protocol, options) => {
    if (process.platform === constants.platforms.windows || isWsl) {
        windows.validateDeRegistrationConfiguration(protocol, options);
        return;
    }
    if (process.platform === constants.platforms.macos) {
        macos.validateDeRegistrationConfiguration(protocol, options);
        return;
    }
    if (process.platform === constants.platforms.linux) {
        linux.validateDeRegistrationConfiguration(protocol, options);
        return;
    }
    throw new Error('Unknown platform');
};

module.exports = {
    validateRegistrationConfig,
    validateDeRegistrationConfig
};
