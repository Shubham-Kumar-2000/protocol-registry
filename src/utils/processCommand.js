const { handleWrapperScript } = require('./wrapperScript');

const preProcessCommands = async (protocol, command, appName) => {
    const newCommand = await handleWrapperScript(protocol, command, appName);
    return newCommand;
};
module.exports = {
    preProcessCommands
};
