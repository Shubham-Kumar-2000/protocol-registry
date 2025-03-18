const fs = require('fs');
const { join } = require('path');

console.log('Initiated....');
console.log('With arguments :');
console.log(process.argv);

fs.writeFileSync(
    join(__dirname, '../temp', process.argv[process.argv.length - 1]),
    JSON.stringify(
        {
            terminal: process.stdout.isTTY || process.stdin.isTTY || false,
            args: process.argv
        },
        null,
        4
    )
);
