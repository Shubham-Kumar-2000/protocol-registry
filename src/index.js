'use strict';

const constants = require('./config/constants');
const linux = require('./linux');
const macos = require('./macos');
const windows = require('./windows');

const getplatform = () => {
    if (process.platform === constants.platforms.windows) return windows;
    if (process.platform === constants.platforms.linux) return linux;
    if (process.platform === constants.platforms.macos) return macos;
    throw new Error('Unknown OS');
};

const platform = getplatform();

module.exports = platform;
