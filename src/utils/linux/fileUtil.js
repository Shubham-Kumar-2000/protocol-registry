const fs = require('fs');
const constants = require('../../config/constants');
const { join } = require('path');

const checkAndRemoveProtocolSchema = (filePaths, protocolSchemaName) => {
    for (const filePath of filePaths) {
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf-8');
            const lines = fileData.split('\n');
            const filteredLines = lines.filter(
                (line) => line !== protocolSchemaName
            );

            if (filteredLines && filteredLines.length > 1) {
                fs.writeFileSync(filePath, filteredLines.join('\n'));
            }
        }
    }
};

const checkIfFolderExists = (directoryPath) => {
    if (!fs.existsSync(directoryPath)) {
        return false;
    }
    return fs.statSync(directoryPath).isDirectory();
};

const fileContainsExactLine = (fileContent, searchLine) => {
    const lines = fileContent.split('\n');

    for (const line of lines) {
        if (line === searchLine) {
            return true;
        }
    }

    return false;
};

const findRegisteredDesktopFilePath = (defaultApp) => {
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

    return desktopFilePaths.find(fs.existsSync);
};

module.exports = {
    checkAndRemoveProtocolSchema,
    checkIfFolderExists,
    fileContainsExactLine,
    findRegisteredDesktopFilePath
};
