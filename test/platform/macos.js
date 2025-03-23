const { expect } = require('@jest/globals');
const constants = require('../config/constants');
const { join } = require('path');
const fs = require('fs');

const getDesktopFileDetails = (protocol, options) => {
    const mainDesktopFileName = (options.appName || `url-${protocol}`) + '.app';
    const mainDesktopFilePath = join(
        constants.homedir,
        protocol,
        mainDesktopFileName
    );
    const internalDesktopFilePath = join(
        constants.homedir,
        protocol,
        `APP-${protocol}.pr.app`
    );
    const scriptFilePath = join(
        constants.homedir,
        protocol,
        `${protocol}-internal-script.pr.sh`
    );
    return {
        mainDesktopFileName,
        mainDesktopFilePath,
        internalDesktopFilePath,
        scriptFilePath
    };
};

const validateRegistrationConfiguration = async (protocol, options) => {
    const {
        mainDesktopFilePath,
        internalDesktopFilePath,
        scriptFilePath
    } = getDesktopFileDetails(protocol, options);

    expect(fs.existsSync(mainDesktopFilePath)).toBeTruthy();
    expect(fs.existsSync(internalDesktopFilePath)).toBe(
        options.terminal || false
    );

    const mainDesktopFilePlistContent = fs.readFileSync(
        join(mainDesktopFilePath, './Contents/Info.plist'),
        'utf-8'
    );
    expect(mainDesktopFilePlistContent).toMatchSnapshot();

    const scriptFileContent = fs.readFileSync(scriptFilePath, 'utf-8');
    expect(scriptFileContent).toMatchSnapshot();

    if (options.terminal) {
        const internalDesktopFilePlistContent = fs.readFileSync(
            join(mainDesktopFilePath, './Contents/Info.plist'),
            'utf-8'
        );
        expect(internalDesktopFilePlistContent).toMatchSnapshot();
    }
};

const validateDeRegistrationConfiguration = async (protocol, options) => {
    const {
        mainDesktopFilePath,
        internalDesktopFilePath,
        scriptFilePath
    } = getDesktopFileDetails(protocol, options);

    expect(fs.existsSync(mainDesktopFilePath)).toBeFalsy();
    expect(fs.existsSync(internalDesktopFilePath)).toBeFalsy();
    expect(fs.existsSync(scriptFilePath)).toBeFalsy();
};

module.exports = {
    validateRegistrationConfiguration,
    validateDeRegistrationConfiguration
};
