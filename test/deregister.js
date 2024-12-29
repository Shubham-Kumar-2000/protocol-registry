const ProtocolRegistry = require('../src');

console.log('DeRegistering...');

ProtocolRegistry.deRegister('testprotobeta').then(() => {
    console.log('Deregistered done!');
});

ProtocolRegistry.checkifExists('testprotobeta').then(console.log);
