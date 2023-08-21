const { join } = require('path');

const constants = {
    platforms: {
        windows: 'win32',
        linux: 'linux',
        macos: 'darwin'
    },
    desktops: {
        current: process.env.XDG_CURRENT_DESKTOP,
        KDE: {
            noProtoExitCode: 4
        }
    },
    homedir: join(require('os').homedir(), '.protocol-registry'),
    urlArgument: {
        win32: '%1',
        win32InScript: '%~1%',
        linux: '%u',
        // eslint-disable-next-line quotes
        darwin: `" & this_URL & "`
    }
};
module.exports = constants;
