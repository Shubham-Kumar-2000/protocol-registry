const { join } = require('path');
const fs = require('fs');
const os = require('os');

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
    homedir: join(os.homedir(), '.protocol-registry'),
    osHomeDir: os.homedir(),
    urlArgument: {
        win32: '%~1%',
        linux: '%u',
        // eslint-disable-next-line quotes
        darwin: `" & this_URL & "`
    },
    tmpdir: (protocol) => {
        return fs.mkdtempSync(`${os.tmpdir()}/register-protocol-${protocol}-`);
    }
};

module.exports = constants;
