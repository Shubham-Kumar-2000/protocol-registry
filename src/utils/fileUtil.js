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

module.exports = {
    findAndDeleteLine
};
