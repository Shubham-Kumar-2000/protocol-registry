const { urlArgument } = require('../config/constants');
const { handleWrapperScript } = require('./wrapperScript');

const subtituteCommand = (command, url) => {
    const identifier = '$_URL_';
    return command.split(identifier).join(url);
};
const preProcessCommands = async (
    protocol,
    command,
    scriptRequired,
    scriptName
) => {
    if (!scriptRequired)
        return subtituteCommand(command, urlArgument[process.platform]);
    const newCommand = await handleWrapperScript(protocol, command, scriptName);
    return newCommand;
};
module.exports = {
    preProcessCommands
};
