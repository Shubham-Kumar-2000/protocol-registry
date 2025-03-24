const { expect } = require('@jest/globals');
const constants = require('../config/constants');
const { join } = require('path');
const fs = require('fs');
const Registry = require('winreg');
const { matchSnapshot } = require('../utils/matchSnapshot');

const getDesktopFileDetails = (protocol, options) => {
    const desktopFileName = (options.appName || `url-${protocol}`) + '.bat';
    const desktopFilePath = join(constants.homedir, protocol, desktopFileName);
    const scriptFilePath = join(
        constants.homedir,
        protocol,
        `${protocol}-internal-script.pr.bat`
    );
    return {
        desktopFilePath,
        scriptFilePath
    };
};

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

const validateRegistrationConfiguration = async (protocol, options) => {
    const { desktopFilePath, scriptFilePath } = getDesktopFileDetails(
        protocol,
        options
    );

    expect(fs.existsSync(desktopFilePath)).toBeTruthy();

    const desktopFileContent = fs.readFileSync(desktopFilePath, 'utf-8');
    matchSnapshot(desktopFileContent);

    const scriptFileContent = fs.readFileSync(scriptFilePath, 'utf-8');
    matchSnapshot(scriptFileContent);

    const { registry, commandRegistry } = getRegistry(protocol);
    const registryKeys = await new Promise((resolve, reject) =>
        registry.valueExists('"URL Protocol"', (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        })
    );
    const command = await new Promise((resolve, reject) =>
        commandRegistry.get('""', (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result.value);
        })
    );
    expect(registryKeys).toBeTruthy();
    expect(command).toBe(`"${desktopFilePath}" "%1"`);
};

const validateDeRegistrationConfiguration = async (protocol, options) => {
    const { desktopFilePath, scriptFilePath } = getDesktopFileDetails(
        protocol,
        options
    );

    expect(fs.existsSync(desktopFilePath)).toBeFalsy();
    expect(fs.existsSync(scriptFilePath)).toBeFalsy();
};

module.exports = {
    validateRegistrationConfiguration,
    validateDeRegistrationConfiguration
};
