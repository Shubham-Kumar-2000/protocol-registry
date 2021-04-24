const path = require('path');

const ProtocolRegistry = require('../src');

console.log('Registering...');
ProtocolRegistry.register({
    protocol: 'testproto',
    command: `node ${path.join(__dirname, './tester.js')}`,
    override: true,
    terminal: true
}).then(async () => {
    console.log('Successfully registered');
});
