const child = require('child_process');
const constants = require('../config/constants');

const checkIfXDGInstalled = () => {
    try {
        child.execSync('xdg-mime --version', {
            stdio: 'pipe'
        });
        return true;
    } catch (e) {
        return false;
    }
};

const installXdgUtils = () => {
    try {
        let killed = false;
        const childProcess = child.exec(
            'sudo apt-get update -y; sudo apt install xdg-utils',
            {
                stdio: 'inherit'
            },
            (error, stdout, stderr) => {
                if (killed) return;
                killed = true;
                if (error) {
                    console.log('Error installing xdg-utils: ');
                    console.log(stderr);
                    console.log('Please install it manually');
                }
            }
        );
        setTimeout(() => {
            if (killed) return;
            killed = true;
            childProcess.kill('SIGKILL');
            console.log('Administrative permissions not provided!!!');
            console.log('Please install xdg-utils manually');
        }, 2 * 60 * 1000);
    } catch (e) {
        console.log('Error installing xdg-utils: ' + e);
        console.log('Please install it manually');
    }
};

if (process.platform === constants.platforms.linux && !checkIfXDGInstalled()) {
    installXdgUtils();
}
