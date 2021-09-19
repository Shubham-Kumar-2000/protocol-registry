const constants = require('../config/constants');
const ejs = require('ejs');
const { join } = require('path');
const { writeFileSync } = require('fs');
const shell = require('shelljs');

const { homedir } = constants;

const batchScriptContent = `@echo off
`;

const subtituteCommand = (command, url) => {
    const identifier = '$_URL_';
    return command.split(identifier).join(url);
};
const getWrapperScriptContent = (command) => {
    return new Promise((resolve, reject) => {
        try {
            if (process.platform === constants.platforms.windows) {
                return resolve(
                    batchScriptContent +
                        subtituteCommand(
                            command,
                            constants.urlArgument[constants.platforms.windows]
                        )
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

const saveWrapperScript = (protocol, content) => {
    const wrapperScriptPath = join(
        homedir,
        `./${protocol}Wrapper.${
            process.platform === constants.platforms.windows ? 'bat' : 'sh'
        }`
    );
    writeFileSync(wrapperScriptPath, content);
    return wrapperScriptPath;
};

exports.handleWrapperScript = async (protocol, command) => {
    const contents = await getWrapperScriptContent(command);
    const scriptPath = saveWrapperScript(protocol, contents);
    if (process.platform !== constants.platforms.windows) {
        const chmod = shell.exec('chmod +x "' + scriptPath + '"');
        if (chmod.code != 0 || chmod.stderr) throw new Error(chmod.stderr);
        return `'${scriptPath}' '${constants.urlArgument[process.platform]}'`;
    }
    // eslint-disable-next-line no-useless-escape
    return `"\"${scriptPath}\" \"${constants.urlArgument[process.platform]}\""`;
};
