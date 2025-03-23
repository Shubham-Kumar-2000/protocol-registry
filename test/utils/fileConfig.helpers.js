const { join } = require('path');
const constants = require('../../src/config/constants');
const fs = require('fs');

const getMimeAppsFilePath = () => {
    const mimeAppPaths = [
        join(constants.osHomeDir, '.config', 'mimeapps.list')
    ];

    return mimeAppPaths;
};

const getDesktopFileData = (defaultApp) => {
    const desktopFilePath = join(
        constants.osHomeDir,
        '.local/share/applications',
        defaultApp
    );

    const fileData = fs.readFileSync(desktopFilePath, 'utf-8');
    const actualAppName = defaultApp.split('.')[0].replaceAll('_', ' ');

    return {
        fileData,
        actualAppName
    };
};

const checkIfRegisteredDesktopFileExists = (defaultApp) => {
    const desktopFilePath = join(
        constants.osHomeDir,
        '.local/share/applications',
        defaultApp
    );

    return fs.existsSync(desktopFilePath);
};

module.exports = {
    getMimeAppsFilePath,
    getDesktopFileData,
    checkIfRegisteredDesktopFileExists
};
