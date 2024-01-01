const which = require('which');

function replace(command) {
    return command
        .split(
            /(?<!\\)(?:[&|;]|&&|\|\||\n)(?=(?:(?:[^"\\]|\\.)|"(?:[^"\\]|\\.)*")*$)/
        )
        .map((cmd) => {
            cmd = cmd
                .trim()
                .split(/\s(?=(?:(?:[^"\\]|\\.)|"(?:[^"\\]|\\.)*")*$)/);
            if (cmd[0].length == 0) return;
            console.log(cmd);
            try {
                cmd[0] = which.sync(cmd[0]); // Replace the command to it's absolute path using which.
            } catch {
                throw new Error(`Command doesn't exist: ${cmd[0]}`);
            }
            return cmd.join(' ');
        })
        .filter((e) => {
            return e !== undefined;
        })
        .join(' && ');
}

module.exports = replace;
