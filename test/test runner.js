// const fs = require('fs');
// const { join } = require('path');
const WebSocket = require('ws');

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

const client = new WebSocket(
    `ws://localhost:${process.argv[process.argv.length - 1]}`
);

client.on('open', async () => {
    console.log('WebSocket client connected');

    client.send(
        JSON.stringify({
            terminal: process.stdout.isTTY || process.stdin.isTTY || false,
            args: process.argv
        })
    );
});

client.on('message', (msg) => {
    console.log(msg);
    client.close();
    // eslint-disable-next-line no-process-exit
    process.exit();
});
