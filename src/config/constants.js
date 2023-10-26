const { join } = require('path');
const fs = require('fs');
const os = require('os');

let _tmpdir;

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
    urlArgument: {
        win32: '%1',
        win32InScript: '%~1%',
        linux: '%u',
        // eslint-disable-next-line quotes
        darwin: `" & this_URL & "`
    },
    get tmpdir() {
        if (!fs.existsSync(_tmpdir)) {
            _tmpdir = fs.mkdtempSync(`${os.tmpdir()}/register-protocol-`);
        }
        return _tmpdir;
    },
};

module.exports = constants;
