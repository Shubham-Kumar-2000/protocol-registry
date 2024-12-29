const ProtocolRegistry = require('../src');

console.log('DeRegistering...');

ProtocolRegistry.deRegister('testprotopeta').then(() => {
    console.log('Deregistered done!');
});

ProtocolRegistry.checkifExists('testprotopeta').then(console.log);
