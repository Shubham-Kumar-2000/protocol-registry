const child = require('child_process');
const { join } = require('path');

const constants = require('../config/constants');

const Reset = '\x1b[0m';
const Blue = '\x1b[34m';
const Green = '\x1b[32m';

const checkIfAllowed = () => {
    try {
        child.execSync(
            `${join(
                __dirname,
                './defaultAppExist.app/Products/usr/local/bin/defaultAppExist'
            )} "https://www.google.com`,
            {
                stdio: 'pipe'
            }
        );
        return true;
    } catch (e) {
        if (e.status == 1 && e.stderr.toString() == '') return true;
        return false;
    }
};
const verify = (show) => {
    if (checkIfAllowed()) {
        if (show) console.log(`${Green}Woohoo!!! App allowed to run.${Reset}`);
        // eslint-disable-next-line no-process-exit
        process.exit();
    }
    console.log(`${Blue}Please Allow app to run...${Reset}`);
    console.log(
        'To allow follow these steps : \nSystem Preferences > Security and Privacy > Allow apps downloaded from'
    );
    console.log('Retrying in 10s...\n');
    setTimeout(() => {
        console.log('Re-verifing.');
        verify(true);
    }, 10000);
};

if (process.platform === constants.platforms.macos) {
    verify(false);
}
