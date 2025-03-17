const ProtocolRegistry = require('../src');

console.log('DeRegistering...');

ProtocolRegistry.deRegister('testproto').then(() => {
    console.log('Deregistered done!');
});

ProtocolRegistry.checkIfExists('testproto').then(console.log);
