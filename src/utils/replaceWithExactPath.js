const which = require('which');

function replace(command) {
    return command
        .split(/&&|;|\n/)
        .map((cmd) => {
            cmd = cmd.trim().split(' ');
            try {
                cmd[0] = which.sync(cmd[0]); // Replace the command to it's absolute path using which.
            } catch {
                throw new Error(`Command doesn't exist: ${cmd[0]}`);
            }
            return cmd.join(' ');
        })
        .join(' && ');
}

module.exports = replace;
