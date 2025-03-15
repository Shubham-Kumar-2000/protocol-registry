const fs = require('fs');

const checkAndRemoveProtocolSchema = (filePaths, protocolSchemaName) => {
    for (const filePath of filePaths) {
        const fileData = fs.readFileSync(filePath, 'utf-8');
        const lines = fileData.split('\n');
        const filteredLines = lines.filter(
            (line) => line !== protocolSchemaName
        );

        if (filteredLines && filteredLines.length > 1) {
            fs.writeFileSync(filePath, filteredLines.join('\n'));
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

module.exports = {
    checkAndRemoveProtocolSchema,
    checkIfFolderExists,
    fileContainsExactLine
};
