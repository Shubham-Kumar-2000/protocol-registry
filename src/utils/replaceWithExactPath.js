const which = require('which');

function replace(command) {
    return command
        .split('&&')
        .map((cmd) => {
            cmd = cmd.trim().split(' ');
            cmd[0] = which.sync(cmd[0]);
            return cmd.join(' ');
        })
        .join(' && ');
}

module.exports = replace;
