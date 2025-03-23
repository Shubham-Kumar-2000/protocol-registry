const { expect } = require('@jest/globals');
const constants = require('../config/constants');
const { join } = require('path');
const fs = require('fs');
const Registry = require('winreg');

const getDesktopFileDetails = (protocol, options) => {
    const desktopFileName = (options.appName || `url-${protocol}`) + '.bat';
    const desktopFilePath = join(constants.homedir, protocol, desktopFileName);
    const scriptFilePath = join(
        constants.homedir,
        protocol,
        `${protocol}-internal-script.pr.sh`
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
    expect(desktopFileContent).toMatchSnapshot();

    const scriptFileContent = fs.readFileSync(scriptFilePath, 'utf-8');
    expect(scriptFileContent).toMatchSnapshot();

    const { registry, commandRegistry } = getRegistry(protocol);
    const appName = await new Promise((resolve, reject) =>
        registry.get('"URL Protocol"', (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result.value);
        })
    );
    const command = await new Promise((resolve, reject) =>
        commandRegistry.get('""', (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result.value);
        })
    );
    expect(appName).toBe(options.appName || `url-${protocol}`);
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
