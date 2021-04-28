const { join } = require('path');

const constants = {
    platforms: {
        windows: 'win32',
        linux: 'linux',
        macos: 'darwin'
    },
    homedir: join(require('os').homedir(), '.protocol-registry'),
    urlArgument: {
        win32: '%1',
        linux: '%u',
        // eslint-disable-next-line quotes
        darwin: `" & this_URL & "`
    }
};
module.exports = constants;
