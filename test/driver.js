const path = require('path');

const ProtocolRegistry = require('../src');

console.log('Registering...');
ProtocolRegistry.register({
    protocol: 'test',
    command: `node ${path.join(__dirname, './tester.js')} $_URL_`,
    override: true,
    terminal: true,
    script: true
}).then(async () => {
    console.log('Successfully registered');
});
