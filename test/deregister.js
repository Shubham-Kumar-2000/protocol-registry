const ProtocolRegistry = require('../src');

console.log('DeRegistering...');

const main = async () => {
    await ProtocolRegistry.deRegister('testproto')
        .then(() => {
            console.log('Deregistered done!');
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
