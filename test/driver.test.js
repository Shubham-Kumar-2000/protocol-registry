const path = require('path');
const randomString = require('randomstring');
const { test, expect, beforeEach, afterEach } = require('@jest/globals');
const { homedir } = require('../src/config/constants');
const fs = require('fs');

const ProtocolRegistry = require('../src');

const newProtocol = () =>
    'testproto' +
    randomString
        .generate({
            length: 5,
            charset: 'alphabetic'
        })
        .toLowerCase();

let protocol = newProtocol();

beforeEach(async () => {
    protocol = newProtocol();
    if (!fs.existsSync(homedir)) fs.mkdirSync(homedir);
});

afterEach(async () => {
    await ProtocolRegistry.deRegister(protocol, { force: true });
    if (fs.existsSync(homedir)) fs.rmdirSync(homedir, { recursive: true });
});

test('Check if exist should be false if protocol is not registered', async () => {
    expect(await ProtocolRegistry.checkifExists(protocol)).toBeFalsy();
});

test('Check if exist should be true if protocol is registered', async () => {
    await ProtocolRegistry.register({
        protocol,
        command: `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        override: true,
        terminal: false,
        script: true,
        scriptName: 'my-custom-script-name'
    });

    expect(await ProtocolRegistry.checkifExists(protocol)).toBeTruthy();
});

test('Check if deRegister should remove the protocol', async () => {
    await ProtocolRegistry.register({
        protocol,
        command: `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        override: true,
        terminal: false,
        script: true,
        scriptName: 'my-custom-script-name'
    });

    await ProtocolRegistry.deRegister(protocol);

    expect(await ProtocolRegistry.checkifExists(protocol)).toBeFalsy();
});

test('Check if deRegister should delete the apps if registered through this module', async () => {
    await ProtocolRegistry.register({
        protocol,
        command: `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        override: true,
        terminal: true,
        script: true,
        scriptName: 'my-custom-script-name'
    });

    await ProtocolRegistry.deRegister(protocol);

    expect(Object.values(fs.readdirSync(homedir).entries())).toHaveLength(0);
});

test('Check if app should be registered again post the same app is deRegistered', async () => {
    await ProtocolRegistry.register({
        protocol,
        command: `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        override: true,
        terminal: false,
        script: true,
        scriptName: 'my-custom-script-name'
    });

    await ProtocolRegistry.deRegister(protocol);

    expect(await ProtocolRegistry.checkifExists(protocol)).toBeFalsy();

    await ProtocolRegistry.register({
        protocol,
        command: `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        override: true,
        terminal: false,
        script: true,
        scriptName: 'my-custom-script-name'
    });

    expect(await ProtocolRegistry.checkifExists(protocol)).toBeTruthy();
});
