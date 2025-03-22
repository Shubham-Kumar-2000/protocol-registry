const { join } = require('path');
const constants = require('../../src/config/constants');
const fs = require('fs');
const { checkIfFolderExists } = require('../../src/utils/fileUtil');

const getConfigPaths = () => {
    const configPaths = [
        join(constants.osHomeDir, '.config', 'mimeapps.list'),
        join(constants.osHomeDir, '.local/share/applications', 'mimeapps.list')
    ];

    return configPaths;
};

const getDesktopFileData = (defaultApp) => {
    const desktopFilePaths = [
        join(constants.osHomeDir, '.local/share/applications', defaultApp)
    ];

    const xdgEnv = process.env.XDG_DATA_DIRS;

    if (xdgEnv) {
        const xdgDataDirs = xdgEnv.split(':');
        if (xdgDataDirs && xdgDataDirs.length) {
            xdgDataDirs.forEach((path) => {
                const isApplicationFolderExist = checkIfFolderExists(
                    join(path, 'applications')
                );

                if (isApplicationFolderExist) {
                    desktopFilePaths.push(
                        join(path, 'applications', defaultApp)
                    );
                }
            });
        }
    }

    const desktopFilePath = desktopFilePaths.find(fs.existsSync);
    const fileData = fs.readFileSync(desktopFilePath, 'utf-8');
    const actualAppName = defaultApp.split('.')[0].replaceAll('_', ' ');

    return {
        fileData,
        actualAppName
    };
};

module.exports = {
    getConfigPaths,
    getDesktopFileData
};
