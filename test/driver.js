const path = require('path');

const ProtocolRegistry = require('../src');

console.log('Registering...');
ProtocolRegistry.register({
    protocol: 'testprotobeta',
    command: `node ${path.join(__dirname, './tester.js')} $_URL_`,
    override: true,
    terminal: true,
    script: true,
    scriptName: 'my-custom-script-name'
}).then(async () => {
    console.log('Successfully registered');
});

ProtocolRegistry.checkifExists('testprotobeta').then(console.log);
