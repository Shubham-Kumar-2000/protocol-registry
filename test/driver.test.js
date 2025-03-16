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
    if (fs.existsSync(homedir)) {
        fs.rmSync(homedir, { recursive: true, force: true });
    }
});

test('Check if exist should be false if protocol is not registered', async () => {
    expect(await ProtocolRegistry.checkIfExists(protocol)).toBeFalsy();
});

test('Check if exist should be true if protocol is registered', async () => {
    await ProtocolRegistry.register(
        protocol,
        `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        {
            override: true,
            terminal: false,
            appName: 'my-custom-script-name'
        }
    );

    expect(await ProtocolRegistry.checkIfExists(protocol)).toBeTruthy();
});

test('Check if deRegister should remove the protocol', async () => {
    await ProtocolRegistry.register(
        protocol,
        `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        {
            override: true,
            terminal: false,
            appName: 'my-custom-script-name'
        }
    );

    await ProtocolRegistry.deRegister(protocol);

    expect(await ProtocolRegistry.checkIfExists(protocol)).toBeFalsy();
});

test('Check if deRegister should delete the apps if registered through this module', async () => {
    await ProtocolRegistry.register(
        protocol,
        `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        {
            override: true,
            terminal: true,
            appName: 'my-custom-script-name'
        }
    );

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
            appName: 'my-custom-script-name'
        }
    );

    await ProtocolRegistry.register(
        protocol + 'del',
        `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        {
            override: true,
            terminal: true,
            appName: 'my-custom-script-name'
        }
    );

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
            appName: 'my-custom-script-name'
        }
    );

    await ProtocolRegistry.deRegister(protocol);

    expect(await ProtocolRegistry.checkIfExists(protocol)).toBeFalsy();

    await ProtocolRegistry.register(
        protocol,
        `node '${path.join(__dirname, './tester.js')}' $_URL_`,
        {
            override: false,
            terminal: false,
            appName: 'my-custom-script-name'
        }
    );

    expect(await ProtocolRegistry.checkIfExists(protocol)).toBeTruthy();
});
