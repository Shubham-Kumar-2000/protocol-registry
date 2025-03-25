const constants = require('../config/constants');
const { join } = require('path');
const { writeFileSync, existsSync, rmSync, mkdirSync } = require('fs');
const shell = require('./shell');

const { homedir } = constants;

const batchScriptContent = `@echo off
`;

const bashScriptContent = `#!/usr/bin/env bash
_URL_=$1
`;

const substituteCommand = (command, url) => {
    const identifier = '$_URL_';
    return command.split(identifier).join(url);
};

const getWrapperScriptContent = (command) => {
    const isWindows = process.platform === constants.platforms.windows;
    const preScriptContent = isWindows ? batchScriptContent : bashScriptContent;
    if (isWindows) {
        command = substituteCommand(
            command,
            constants.urlArgument[constants.platforms.windows]
        );
    }

    return preScriptContent + command;
};

const saveWrapperScript = (protocol, content) => {
    if (existsSync(join(homedir, `./${protocol}`))) {
        rmSync(join(homedir, `./${protocol}`), {
            recursive: true,
            force: true
        });
    }
    mkdirSync(join(homedir, `./${protocol}`), { recursive: true });
    const wrapperScriptPath = join(
        homedir,
        `./${protocol}/${protocol}-internal-script.pr.${
            process.platform === constants.platforms.windows ? 'bat' : 'sh'
        }`
    );
    writeFileSync(wrapperScriptPath, content);
    return wrapperScriptPath;
};

exports.handleWrapperScript = async (protocol, command) => {
    const contents = getWrapperScriptContent(command);
    const scriptPath = saveWrapperScript(protocol, contents);
    if (process.platform !== constants.platforms.windows) {
        const chmod = await shell.exec('chmod +x "' + scriptPath + '"');
        if (chmod.code != 0 || chmod.stderr) throw new Error(chmod.stderr);
        return `'${scriptPath}' '${constants.urlArgument[process.platform]}'`;
    }
    return `"${scriptPath}" "${constants.urlArgument[process.platform]}"`;
};
