const WebSocket = require('ws');
const { expect, afterAll, beforeEach, afterEach } = require('@jest/globals');
const randomString = require('randomstring');
const shell = require('../../src/utils/shell');
const constants = require('../config/constants');
const { join } = require('path');

let wsServer = null;

const sleep = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
};

const grantPermissions = async (protocol, options) => {
    if (
        process.platform !== constants.platforms.macos ||
        options.terminal !== true
    )
        return;

    const identifier = await shell.exec(
        `osascript -e 'id of app "${join(
            constants.homedir,
            protocol,
            'APP-' + protocol + '.app'
        )}"'`,
        {
            silent: true
        }
    );
    if (identifier.code != 0 || identifier.stderr)
        throw new Error(identifier.stderr);

    console.log(identifier);

    const result = await shell.exec(
        'sudo tccutil --insert Accessibility ' + identifier,
        {
            silent: true
        }
    );
    if (result.code != 0 || result.stderr) throw new Error(result.stderr);
};

const createServer = () => {
    if (!constants.checkIntegration) return;
    destroyServer();
    wsServer = new WebSocket.Server({ port: constants.wssPort });
};

const destroyServer = () => {
    if (wsServer) {
        wsServer.close();
    }
    wsServer = null;
};

beforeEach(createServer);

afterEach(destroyServer);
afterAll(destroyServer);

const checkRegistration = async (protocol, options) => {
    if (!constants.checkIntegration) return;

    const promise = new Promise((resolve) => {
        wsServer.on('connection', (ws) => {
            ws.on('message', (message) => {
                ws.send('Thanks');
                resolve(JSON.parse(message.toString()));
            });
        });
    });
    await sleep();
    await grantPermissions(protocol, options);
    const url = await openProtocol(protocol);
    const childProcessData = await promise;
    expect(childProcessData.terminal).toBe(options.terminal || false);
    expect(childProcessData.args.includes(url)).toBeTruthy();
};

const checkDeRegistration = async (protocol) => {
    if (!constants.checkIntegration) return;
    if (process.platform === constants.platforms.windows) return; // registry is the only way to validate in windows
    await expect(openProtocol(protocol)).rejects.toThrow();
};

const openProtocol = async (protocol) => {
    const url = `${protocol}://${randomString.generate({
        charset: 'alphabetic'
    })}/`;

    const command =
        process.platform === constants.platforms.windows
            ? `start "${protocol}" "${url}"`
            : `open '${url}'`;
    const result = await shell.exec(command);
    if (result.code != 0 || result.stderr) throw new Error(result.stderr);
    return url;
};

module.exports = {
    checkRegistration,
    checkDeRegistration,
    destroyServer,
    createServer
};
