const constants = require('../config/constants');
const ejs = require('ejs');
const { join } = require('path');
const { writeFileSync, existsSync, rmSync, mkdirSync } = require('fs');
const shell = require('./shell');

const { homedir } = constants;

const batchScriptContent = `@echo off
`;

const subtituteCommand = (command, url) => {
    const identifier = '$_URL_';
    return command.split(identifier).join(url);
};
const subtituteWindowsCommand = (command) => {
    let identifier = '"$_URL_"';
    command = command
        .split(identifier)
        .join(
            `"${
                constants.urlArgument[constants.platforms.windows + 'InScript']
            }"`
        );
    // eslint-disable-next-line quotes
    identifier = "'$_URL_'";
    command = command
        .split(identifier)
        .join(
            `'${
                constants.urlArgument[constants.platforms.windows + 'InScript']
            }'`
        );
    return subtituteCommand(
        command,
        constants.urlArgument[constants.platforms.windows]
    );
};
const getWrapperScriptContent = (command) => {
    return new Promise((resolve, reject) => {
        try {
            if (process.platform === constants.platforms.windows) {
                return resolve(
                    batchScriptContent + subtituteWindowsCommand(command)
                );
            }
            ejs.renderFile(
                join(__dirname, './wrapperScript.ejs'),
                { command },
                function (err, str) {
                    if (err) return reject(err);
                    resolve(str);
                }
            );
            return;
        } catch (e) {
            reject(e);
        }
    });
};

const saveWrapperScript = (protocol, content, scriptName) => {
    if (existsSync(join(homedir, `./${protocol}`))) {
        rmSync(join(homedir, `./${protocol}`), {
            recursive: true,
            force: true
        });
    }
    mkdirSync(join(homedir, `./${protocol}`));
    const wrapperScriptPath = join(
        homedir,
        `./${protocol}/${scriptName || protocol}.${
            process.platform === constants.platforms.windows ? 'bat' : 'sh'
        }`
    );
    writeFileSync(wrapperScriptPath, content);
    return wrapperScriptPath;
};

exports.handleWrapperScript = async (protocol, command, scriptName) => {
    const contents = await getWrapperScriptContent(command);
    const scriptPath = saveWrapperScript(protocol, contents, scriptName);
    if (process.platform !== constants.platforms.windows) {
        const chmod = await shell.exec('chmod +x "' + scriptPath + '"');
        if (chmod.code != 0 || chmod.stderr) throw new Error(chmod.stderr);
        return `'${scriptPath}' '${constants.urlArgument[process.platform]}'`;
    }
    return `"${scriptPath}" "${constants.urlArgument[process.platform]}"`;
};
