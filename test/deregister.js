const ProtocolRegistry = require('../src');

console.log('DeRegistering...');

ProtocolRegistry.deRegister('testprotozeta').then(() => {
    console.log('Deregistered done!');
});

ProtocolRegistry.checkifExists('testprotozeta').then(console.log);
