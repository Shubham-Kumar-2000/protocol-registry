const ProtocolRegistry = require('../../src');
const constants = require('../../src/config/constants');
const {
    getMimeAppsFilePath,
    getDesktopFileData,
    checkIfRegisteredDesktopFileExists
} = require('./fileConfig.helpers');
const shell = require('../../src/utils/shell');
const { expect } = require('@jest/globals');

const validateRegistrationConfig = async (protocol) => {
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
        return;
    }
    throw new Error('Unknown platform');
};

const validateDeRegistrationConfig = async (defaultApp) => {
    if (!constants.checkIntegration) return;
    if (process.platform === constants.platforms.windows) {
        //TODO: Implement windows desktop file check
        return;
    }
    if (process.platform === constants.platforms.macos) {
        // TODO: Implement macos desktop file check
        return;
    }
    if (process.platform === constants.platforms.linux) {
        console.log('defaultApp', defaultApp);
        if (defaultApp) {
            await validateLinuxDesktopFileNotExist(defaultApp);
        }
        return;
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

const validateLinuxDesktopFileNotExist = async (defaultApp) => {
    const configPaths = getMimeAppsFilePath();
    for (const configPath of configPaths) {
        const content = await shell.exec(
            `cat '${configPath}' | grep '${defaultApp}'`
        );
        expect(content.code).toBe(1);
        expect(content.stdout).toBeFalsy();
        expect(content.stderr).toBeFalsy();
    }

    const registeredDesktopFileExist = checkIfRegisteredDesktopFileExists(
        defaultApp
    );
    expect(registeredDesktopFileExist).toBeFalsy();
};

module.exports = {
    validateRegistrationConfig,
    validateDeRegistrationConfig
};
