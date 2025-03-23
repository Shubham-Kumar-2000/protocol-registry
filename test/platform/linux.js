const { expect } = require('@jest/globals');
const constants = require('../config/constants');
const { join } = require('path');
const fs = require('fs');

const getMimeAppsFilePath = () => {
    const mimeAppPaths = [
        join(constants.osHomeDir, '.config', 'mimeapps.list')
        // join(constants.osHomeDir, '.local/share/applications', 'mimeapps.list')
    ];

    return mimeAppPaths;
};

const getDesktopFileDetails = (protocol, options) => {
    const desktopFileName =
        (options.appName || `url-${protocol}`).replaceAll(' ', '_') +
        `.${protocol}.pr.desktop`;
    const desktopFilePath = join(
        constants.osHomeDir,
        '.local/share/applications',
        desktopFileName
    );
    const scriptFilePath = join(
        constants.homedir,
        protocol,
        `${protocol}-internal-script.pr.sh`
    );
    return { desktopFileName, desktopFilePath, scriptFilePath };
};

const validateRegistrationConfiguration = async (protocol, options) => {
    const {
        desktopFileName,
        desktopFilePath,
        scriptFilePath
    } = getDesktopFileDetails(protocol, options);
    const configPaths = getMimeAppsFilePath();

    for (const configPath of configPaths) {
        if (!fs.existsSync(configPath)) continue;

        const configContent = fs.readFileSync(configPath, 'utf-8');

        expect(
            configContent.includes(
                `x-scheme-handler/${protocol}=${desktopFileName}`
            )
        ).toBeTruthy();
    }

    const desktopFileContent = fs.readFileSync(desktopFilePath, 'utf-8');
    expect(desktopFileContent).toMatchSnapshot();

    const scriptFileContent = fs.readFileSync(scriptFilePath, 'utf-8');
    expect(scriptFileContent).toMatchSnapshot();
};

const validateDeRegistrationConfiguration = async (protocol, options) => {
    const {
        desktopFileName,
        desktopFilePath,
        scriptFilePath
    } = getDesktopFileDetails(protocol, options);
    const configPaths = getMimeAppsFilePath();

    for (const configPath of configPaths) {
        if (!fs.existsSync(configPath)) continue;

        const configContent = fs.readFileSync(configPath, 'utf-8');

        expect(
            configContent.includes(
                `x-scheme-handler/${protocol}=${desktopFileName}`
            )
        ).toBeFalsy();
    }

    expect(fs.existsSync(desktopFilePath)).toBeFalsy();
    expect(fs.existsSync(scriptFilePath)).toBeFalsy();
};

module.exports = {
    validateRegistrationConfiguration,
    validateDeRegistrationConfiguration
};
