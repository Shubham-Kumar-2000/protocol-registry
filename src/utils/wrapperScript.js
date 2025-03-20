const constants = require('../config/constants');
const ejs = require('ejs');
const { join } = require('path');
const { writeFileSync, existsSync, rmSync, mkdirSync } = require('fs');
const shell = require('./shell');

const { homedir } = constants;

const batchScriptContent = `@echo off
`;

const substituteCommand = (command, url) => {
    const identifier = '$_URL_';
    return command.split(identifier).join(url);
};

const getWrapperScriptContent = (command) => {
    return new Promise((resolve, reject) => {
        try {
            if (process.platform === constants.platforms.windows) {
                return resolve(
                    batchScriptContent +
                        substituteCommand(
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
    const contents = await getWrapperScriptContent(command);
    const scriptPath = saveWrapperScript(protocol, contents);
    if (process.platform !== constants.platforms.windows) {
        const chmod = await shell.exec('chmod +x "' + scriptPath + '"');
        if (chmod.code != 0 || chmod.stderr) throw new Error(chmod.stderr);
        return `'${scriptPath}' '${constants.urlArgument[process.platform]}'`;
    }
    return `"${scriptPath}" "${constants.urlArgument[process.platform]}"`;
};
