const child = require('child_process');
const constants = require('../config/constants');

const run_script = (command, args, callback) => {
    const localChild = child.spawn(command, args, { shell: true });

    let scriptOutput = '';
    let scriptError = '';

    localChild.stdout.setEncoding('utf8');
    localChild.stdout.on('data', function (data) {
        data = data.toString();
        scriptOutput += data;
    });

    localChild.stderr.setEncoding('utf8');
    localChild.stderr.on('data', function (data) {
        data = data.toString();
        scriptError += data;
    });

    localChild.on('close', function (code) {
        callback(code, scriptOutput, scriptError);
    });

    return localChild;
};

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
        const childProcess = run_script(
            'sudo apt-get update -y && sudo apt install xdg-utils',
            [],
            (error, stdout, stderr) => {
                if (killed) return;
                killed = true;
                if (error) {
                    console.log('Error installing xdg-utils: ');
                    console.log(stderr);
                    console.log('Please install it manually');
                }
                // eslint-disable-next-line no-process-exit
                process.exit(0);
            }
        );
        setTimeout(() => {
            if (killed) return;
            killed = true;
            childProcess.kill('SIGKILL');
            console.log('\nAdministrative permissions not provided!!!');
            console.log('Please install xdg-utils manually');
            // eslint-disable-next-line no-process-exit
            process.exit(0);
        }, 2 * 60 * 1000);
    } catch (e) {
        console.log('Error installing xdg-utils: ' + e);
        console.log('Please install it manually');
    }
};

if (process.platform === constants.platforms.linux && !checkIfXDGInstalled()) {
    installXdgUtils();
}
