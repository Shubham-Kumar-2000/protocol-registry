const { exec } = require('child_process');

exports.exec = (...args) => {
    let command = '';
    let options = { encoding: 'utf8' };
    let callback = null;
    if (args.length === 0) {
        throw new Error('No arguments passed');
    }
    if (args.length === 1) {
        command = args[0];
    }
    if (args.length === 2) {
        if (args[1] instanceof Function) {
            command = args[0];
            callback = args[1];
        } else {
            command = args[0];
            options = args[1];
        }
    }
    if (args.length === 3) {
        command = args[0];
        options = args[1];
        callback = args[2];
    }
    return new Promise((resolve) => {
        exec(command, options, (err, stdout, stderr) => {
            const data = {};
            data.stdout = stdout;
            data.stderr = stderr;
            if (!err) {
                data.code = 0;
            } else if (err.code === undefined) {
                data.code = 1;
            } else {
                data.code = err.code;
            }
            if (callback) {
                callback(data.code, data.stdout, data.stderr);
            }
            resolve(data);
        });
    });
};
