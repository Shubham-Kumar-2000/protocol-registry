const child = require('child_process');
const constants = require('./config/constants');

const checkIfXDGInstalled = () => {
    try {
        child.execSync(' xdg-mime --version', {
            stdio: 'pipe'
        });
        return true;
    } catch (e) {
        return false;
    }
};

const installXdgUtils = () => {
    try {
        child.execSync('sudo apt-get update -y; sudo apt install xdg-utils', {
            stdio: 'inherit'
        });
    } catch (e) {
        console.log('Error installing xdg-utils: ' + e);
        console.log('Please install it manually');
    }
};

if (process.platform === constants.platforms.linux && !checkIfXDGInstalled()) {
    installXdgUtils();
}

// const checkIfDutiInstalled = () => {
//     try {
//         child.execSync('duti -V', {
//             stdio: 'pipe'
//         });
//         return true;
//     } catch (e) {
//         return false;
//     }
// };

// const installDuti = () => {
//     try {
//         child.execSync('brew install duti', {
//             stdio: 'inherit'
//         });
//     } catch (e) {
//         console.log('Error installing xdg-utils: ' + e);
//         console.log('Please install it manually');
//     }
// };
// if (process.platform === constants.platforms.macos && !checkIfDutiInstalled()) {
//     installDuti();
// }
