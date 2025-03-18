// const fs = require('fs');
// const { join } = require('path');
const messenger = require('messenger');

console.log('Initiated....');
console.log('With arguments :');
console.log(process.argv);

// fs.writeFileSync(
//     join(__dirname, '../temp', process.argv[process.argv.length - 1]),
//     JSON.stringify(
//         {
//             terminal: process.stdout.isTTY || process.stdin.isTTY || false,
//             args: process.argv
//         },
//         null,
//         4
//     )
// );

const client = messenger.createSpeaker(process.argv[process.argv.length - 1]);
client.request(
    'message',
    {
        terminal: process.stdout.isTTY || process.stdin.isTTY || false,
        args: process.argv
    },
    function (data) {
        console.log(data);
        // eslint-disable-next-line no-process-exit
        process.exit();
    }
);
