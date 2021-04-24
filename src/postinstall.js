const spawn = require('child_process').spawn;
const constants = require('./config/constants');

if (process.platform === constants.platforms.linux) {
    const child = spawn('sudo apt-get update -y; sudo apt install xdg-utils', {
        stdio: true
    });
    child.on('error', function (err) {
        console.log('Error installing xdg-utils: ' + err);
        console.log('Please install it manually');
    });
}
