const path = require('path');

const ProtocolRegistry = require('../src');

console.log('Registering...');
ProtocolRegistry.register({
    protocol: 'testproto',
    command: `node ${path.join(__dirname, './speak.js')} $_URL_`,
    override: true,
    terminal: false,
    script: true,
    scriptName: 'my-custom-script-name'
}).then(async () => {
    console.log('Successfully registered');
});

ProtocolRegistry.checkifExists('testproto').then(console.log);
