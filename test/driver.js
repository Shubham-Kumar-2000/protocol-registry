const path = require('path');

const ProtocolRegistry = require('../src');

console.log('Registering...');
ProtocolRegistry.register(
    'testproto',
    `node '${path.join(__dirname, './tester.js')}' $_URL_`,
    {
        override: true,
        terminal: true,
        script: true,
        appName: 'my-custom-script-name'
    }
).then(async () => {
    console.log('Successfully registered');
});

ProtocolRegistry.checkIfExists('testproto').then(console.log);
