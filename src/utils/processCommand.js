const { handleWrapperScript } = require('./wrapperScript');

const preProcessCommands = async (protocol, command) => {
    const newCommand = await handleWrapperScript(protocol, command);
    return newCommand;
};
module.exports = {
    preProcessCommands
};
