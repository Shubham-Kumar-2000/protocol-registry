const { handleWrapperScript } = require('./wrapperScript');

const preProcessCommands = async (protocol, command, scriptName) => {
    const newCommand = await handleWrapperScript(protocol, command, scriptName);
    return newCommand;
};
module.exports = {
    preProcessCommands
};
