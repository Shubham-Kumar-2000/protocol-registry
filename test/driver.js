const path = require('path');

const ProtocolRegistry = require('../src');

console.log('Registering...');
const main = async () => {
    await ProtocolRegistry.register(
        'testproto',
        `node "${path.join(__dirname, './tester.js')}" "$_URL_"`,
        {
            override: true,
            terminal: true,
            appName: 'My-App App 007'
        }
    )
        .then(async () => {
            console.log('Successfully registered');
        })
        .catch(console.error);

    await ProtocolRegistry.getDefaultApp('testproto')
        .then(console.log)
        .catch(console.error);

    await ProtocolRegistry.checkIfExists('testproto')
        .then(console.log)
        .catch(console.error);
};

main();
