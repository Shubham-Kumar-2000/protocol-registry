const path = require('path');
const {
    test,
    expect,
    afterEach,
    beforeAll,
    afterAll
} = require('@jest/globals');
const { homedir } = require('../src/config/constants');
const fs = require('fs');
const {
    validateRegistrationConfig,
    validateDeRegistrationConfig
} = require('./utils/configuration-test');

const ProtocolRegistry = require('../src');
const { checkRegistration } = require('./utils/integration-test');
const constants = require('./config/constants');
const { matchSnapshot } = require('./utils/matchSnapshot');

const protocol = 'regimen';

const getCommand = () => {
    return `node "${path.join(__dirname, './test runner.js')}" "$_URL_" ${
        constants.wssPort
    }`;
};

beforeAll(async () => {
    await ProtocolRegistry.deRegister(protocol, { force: true });
});

afterEach(async () => {
    await ProtocolRegistry.deRegister(protocol, { force: true });
    if (fs.existsSync(homedir)) {
        fs.rmSync(homedir, { recursive: true, force: true });
    }
});

afterAll(async () => {
    await ProtocolRegistry.deRegister(protocol, { force: true });
});

test.each([
    {
        name: 'should register protocol without options'
    },
    {
        name: 'should register protocol with override is false',

        options: {
            override: false
        }
    },
    {
        name: 'should register protocol with terminal is false',

        options: {
            terminal: false
        }
    },
    {
        name:
            'should register protocol with override is true and protocol does not exist',

        options: {
            override: true
        }
    },
    {
        name: 'should register protocol with terminal is true',

        options: {
            terminal: true
        }
    },
    {
        name: 'should register protocol with custom app name',

        options: {
            appName: 'custom-app-name'
        }
    },
    {
        name:
            'should register protocol with custom app name with multiple spaces',

        options: {
            terminal: true,
            override: true,
            appName: 'custom App-name 1'
        }
    }
])(
    process.platform + ' $name',
    async (args) => {
        await ProtocolRegistry.register(protocol, getCommand(), args.options);

        await checkRegistration(protocol, args.options || {});
        await validateRegistrationConfig(protocol, args.options || {});

        expect(await ProtocolRegistry.checkIfExists(protocol)).toBeTruthy();

        matchSnapshot(await ProtocolRegistry.getDefaultApp(protocol));

        await ProtocolRegistry.deRegister(protocol);
        await validateDeRegistrationConfig(protocol, args.options || {});

        expect(await ProtocolRegistry.checkIfExists(protocol)).toBeFalsy();
    },
    constants.jestTimeOut
);

test('checkIfExists should be false if protocol is not registered', async () => {
    expect(await ProtocolRegistry.checkIfExists('atestproto')).toBeFalsy();
});

test('checkIfExists should be true if protocol is registered', async () => {
    const options = {
        override: true,
        terminal: false,
        appName: 'my-custom-app-name'
    };
    await ProtocolRegistry.register(protocol, getCommand(), options);

    expect(await ProtocolRegistry.checkIfExists(protocol)).toBeTruthy();
});

test('should fail registration when protocol already exist and override is false', async () => {
    const options = {
        override: false,
        terminal: false
    };
    await ProtocolRegistry.register(protocol, getCommand(), options);

    expect(await ProtocolRegistry.checkIfExists(protocol)).toBeTruthy();

    await expect(
        ProtocolRegistry.register(protocol, getCommand(), options)
    ).rejects.toThrow();

    expect(await ProtocolRegistry.checkIfExists(protocol)).toBeTruthy();
});

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
            appName: 'App Name'
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
