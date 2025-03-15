const fs = require('fs');

const checkAndRemoveProtocolSchema = (filePaths, protocolSchemaName) => {
    let hasProtocolSchema = false;

    for (const filePath of filePaths) {
        const fileData = fs.readFileSync(filePath, 'utf-8');
        const lines = fileData.split('\n');
        const filteredLines = lines.filter(
            (line) => line !== protocolSchemaName
        );

        if (lines.length !== filteredLines.length) {
            hasProtocolSchema = true;
        }
        if (filteredLines && filteredLines.length > 1) {
            fs.writeFileSync(filePath, filteredLines.join('\n'));
        }
    }

    return hasProtocolSchema;
};

const checkIfFolderExists = (directoryPath) => {
    try {
        const stats = fs.statSync(directoryPath);
        return stats.isDirectory();
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        }
        throw error;
    }
};

const checkIfFileExists = (filePath) => {
    try {
        const stats = fs.statSync(filePath);
        return stats.isFile();
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        }
        throw error;
    }
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

module.exports = {
    checkAndRemoveProtocolSchema,
    checkIfFolderExists,
    checkIfFileExists,
    fileContainsExactLine
};
