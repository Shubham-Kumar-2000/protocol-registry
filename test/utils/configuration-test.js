const ProtocolRegistry = require('../../src');
const constants = require('../../src/config/constants');
const {
    getMimeAppsFilePath,
    getDesktopFileData
} = require('./fileConfig.helpers');
const shell = require('../../src/utils/shell');
const { expect } = require('@jest/globals');

const checkRegistrationConfig = async (protocol) => {
    if (!constants.checkIntegration) return;
    const defaultApp = await ProtocolRegistry.getDefaultApp(protocol);
    if (process.platform === constants.platforms.windows) {
        //TODO: Implement windows desktop file check
        return;
    }
    if (process.platform === constants.platforms.macos) {
        // TODO: Implement macos desktop file check
        return;
    }
    if (process.platform === constants.platforms.linux) {
        validateLinuxDesktopFile(protocol, defaultApp);
    }
    throw new Error('Unknown platform');
};

const validateLinuxDesktopFile = async (protocol, defaultApp) => {
    const configPaths = getMimeAppsFilePath();

    for (const configPath of configPaths) {
        const content = await shell.exec(
            `cat '${configPath}' | grep '${defaultApp}'`
        );
        expect(content.code).toBe(0);
        expect(content.stdout).toBeTruthy();
        expect(content.stdout.includes(defaultApp)).toBeTruthy();
        break;
    }

    const { actualAppName, fileData } = getDesktopFileData(defaultApp);
    expect(
        fileData.includes(`PRIdentifier=com.protocol.registry.${protocol}`)
    ).toBeTruthy();
    expect(fileData.includes(`Name=${actualAppName}`)).toBeTruthy();
    return;
};

module.exports = {
    checkRegistrationConfig
};
