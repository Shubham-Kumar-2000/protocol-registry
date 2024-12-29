const fs = require('fs');

const findAndDeleteLine = (configPath, searchString) => {
    const removedLines = [];

    for (const filePath of configPath) {
        try {
            const fileData = fs.readFileSync(filePath, 'utf-8');
            const lines = fileData.split('\n');
            const filteredLines = lines.filter(
                (line) => !line.includes(searchString)
            );

            if (lines.length !== filteredLines.length) {
                const removedLine = lines.find((line) =>
                    line.includes(searchString)
                );
                removedLines.push({ filePath, removedLine });
            }
            if (filteredLines && filteredLines.length > 1) {
                fs.writeFileSync(filePath, filteredLines.join('\n'));
            }
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error);
        }
    }

    return removedLines;
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

module.exports = {
    findAndDeleteLine,
    checkIfFolderExists,
    checkIfFileExists
};
