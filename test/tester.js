const fs = require('fs');
const { join } = require('path');

console.log('Initiated....');
console.log('With arguments :');
console.log(process.argv);
console.log('Waiting to be terminated ...');

const data = {
    args: process.argv
};

if (!fs.existsSync(join(__dirname, '../temp'))) {
    fs.mkdirSync(join(__dirname, '../temp'), { recursive: true });
}

fs.writeFileSync(
    join(__dirname, '../temp/data.json'),
    JSON.stringify(data, null, 4)
);

// eslint-disable-next-line no-constant-condition
while (true);
