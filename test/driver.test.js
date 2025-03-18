const path = require('path');
const randomString = require('randomstring');
const {
    test,
    expect,
    beforeEach,
    afterEach,
    afterAll
} = require('@jest/globals');
const { homedir } = require('../src/config/constants');
const fs = require('fs');
const shell = require('../src/utils/shell');

const ProtocolRegistry = require('../src');
const constants = require('../src/config/constants');

const WebSocket = require('ws');

let wsServer = null;

const newProtocol = () =>
    'testproto' +
    randomString
        .generate({
            length: 5,
            charset: 'alphabetic'
        })
        .toLowerCase();

let protocol = newProtocol();

const sleep = async () => {
    if (process.platform === constants.platforms.macos) {
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
};

const getCommand = () => {
    if (process.platform === constants.platforms.windows) {
        return `node "${path.join(
            __dirname,
            './test runner.js'
        )}" "$_URL_" 8000`;
    }
    return `node '${path.join(__dirname, './test runner.js')}' "$_URL_" 8000`;
};

const openProtocol = async (protocol) => {
    const url = `${protocol}://${randomString.generate({
        charset: 'alphabetic'
    })}`;

    const command =
        process.platform === constants.platforms.windows
            ? `start "${protocol}" "${url}"`
            : `open '${url}'`;
    const result = await shell.exec(command);
    if (result.code != 0 || result.stderr) throw new Error(result.stderr);
    return url;
};

const checkRegistration = async (protocol, options) => {
    wsServer = new WebSocket.Server({ port: 8000 });

    const promise = new Promise((resolve) => {
        wsServer.on('connection', (ws) => {
            ws.on('message', (message) => {
                ws.send('Thanks');
                resolve(JSON.parse(message.toString()));
            });
        });
    });
    const url = await openProtocol(protocol);
    const childProcessData = await promise;
    expect(childProcessData.terminal).toBe(options.terminal || false);
    expect(childProcessData.args.includes(url)).toBeTruthy();
};

beforeEach(async () => {
    protocol = newProtocol();
});

afterEach(async () => {
    await sleep();
    await ProtocolRegistry.deRegister(protocol, { force: true });
    if (fs.existsSync(homedir)) {
        fs.rmSync(homedir, { recursive: true, force: true });
    }
    if (wsServer) {
        wsServer.close();
    }
});

afterAll(async () => {
    // eslint-disable-next-line no-process-exit
    if (wsServer) {
        wsServer.close();
    }
});

test('Check if exist should be false if protocol is not registered', async () => {
    expect(await ProtocolRegistry.checkIfExists(protocol)).toBeFalsy();
});

test('Check if exist should be true if protocol is registered', async () => {
    const options = {
        override: true,
        terminal: false,
        appName: 'my-custom-app-name'
    };
    await ProtocolRegistry.register(protocol, getCommand(), options);

    expect(await ProtocolRegistry.checkIfExists(protocol)).toBeTruthy();
    await checkRegistration(protocol, options);
}, 30000);

test('Check if deRegister should remove the protocol', async () => {
    await ProtocolRegistry.register(
        protocol,
        `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        {
            override: true,
            terminal: false,
            appName: 'my-custom-app-name007'
        }
    );

    await sleep();

    await ProtocolRegistry.deRegister(protocol);

    expect(await ProtocolRegistry.checkIfExists(protocol)).toBeFalsy();
    await expect(openProtocol(protocol)).rejects.toThrow();
});

test('Check if deRegister should delete the apps if registered through this module', async () => {
    await ProtocolRegistry.register(
        protocol,
        `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        {
            override: true,
            terminal: true,
            appName: 'App Name'
        }
    );

    await sleep();

    await ProtocolRegistry.deRegister(protocol);

    expect(fs.existsSync(homedir)).toBeFalsy();
});

test('Check if deRegister should not delete the homedir if other registered apps exist', async () => {
    await ProtocolRegistry.register(
        protocol,
        `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        {
            override: true,
            terminal: true,
            appName: 'my-custom-app-name'
        }
    );

    await ProtocolRegistry.register(
        protocol + 'del',
        `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        {
            override: true,
            terminal: true,
            appName: 'my-custom-app-name'
        }
    );

    await sleep();

    await ProtocolRegistry.deRegister(protocol + 'del');

    expect(fs.existsSync(homedir)).toBeTruthy();
});

test('Check if app should be registered again post the same app is deRegistered', async () => {
    await ProtocolRegistry.register(
        protocol,
        `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        {
            override: true,
            terminal: false,
            appName: 'my-custom-app-name'
        }
    );

    await sleep();

    await ProtocolRegistry.deRegister(protocol);

    expect(await ProtocolRegistry.checkIfExists(protocol)).toBeFalsy();

    await ProtocolRegistry.register(
        protocol,
        `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        {
            override: false,
            terminal: false,
            appName: 'my-custom app-name'
        }
    );

    expect(await ProtocolRegistry.checkIfExists(protocol)).toBeTruthy();
});
