const WebSocket = require('ws');
const { expect } = require('@jest/globals');
const randomString = require('randomstring');
const shell = require('../../src/utils/shell');
const constants = require('../config/constants');

const sleep = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
};

const checkRegistration = async (protocol, options) => {
    if (!constants.checkIntegration) return;
    const wsServer = new WebSocket.Server({ port: constants.wssPort });
    try {
        const promise = new Promise((resolve) => {
            wsServer.on('connection', (ws) => {
                ws.on('message', (message) => {
                    ws.send('Thanks');
                    resolve(JSON.parse(message.toString()));
                });
            });
        });
        await sleep();
        const url = await openProtocol(protocol);
        const childProcessData = await promise;
        expect(childProcessData.terminal).toBe(options.terminal || false);
        expect(childProcessData.args.includes(url)).toBeTruthy();
    } finally {
        wsServer.close();
    }
};

const checkDeRegistration = async (protocol) => {
    if (!constants.checkIntegration) return;
    if (process.platform === constants.platforms.windows) return; // registry is the only way to validate in windows
    await expect(openProtocol(protocol)).rejects.toThrow();
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

module.exports = {
    checkRegistration,
    checkDeRegistration
};
