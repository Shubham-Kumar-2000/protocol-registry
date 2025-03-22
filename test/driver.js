const path = require('path');

const ProtocolRegistry = require('../src');

console.log('Registering...');
ProtocolRegistry.register(
    'testprotofs',
    `node '${path.join(__dirname, './tester.js')}' "$_URL_"`,
    {
        override: true,
        terminal: true,
        appName: 'My-Custom App 007'
    }
).then(async () => {
    console.log('Successfully registered');
});

ProtocolRegistry.checkIfExists('testprotofs').then(console.log);
