const fs = require('fs');
const { join } = require('path');
const WebSocket = require('ws');

console.log('Initiated....');
console.log('With arguments :');
console.log(process.argv);

const isWindows = process.platform === 'win32';

const isTerminalWindows = () => {
    if (!isWindows) return false;
    return process.title.includes('.protocol-registry') || false;
};

const isTerminalOthers = () => {
    if (isWindows) return false;
    return process.stdout.isTTY || process.stdin.isTTY;
};

const data = {
    terminal: isTerminalWindows() || isTerminalOthers() || false,
    args: process.argv
};

fs.writeFileSync(
    join(__dirname, '../temp/data.json'),
    JSON.stringify(data, null, 4)
);

const client = new WebSocket(
    `ws://localhost:${process.argv[process.argv.length - 1]}`
);

client.on('open', async () => {
    console.log('WebSocket client connected');

    client.send(JSON.stringify(data));
});

client.on('message', (msg) => {
    console.log(msg);
    client.close();
    // eslint-disable-next-line no-process-exit
    process.exit();
});

client.on('error', (err) => {
    console.log(err);
    // eslint-disable-next-line no-process-exit
    process.exit();
});
