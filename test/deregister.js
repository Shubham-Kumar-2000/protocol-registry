const ProtocolRegistry = require('../src');

console.log('DeRegistering...');

ProtocolRegistry.deRegister('protocalgamma').then(() => {
    console.log('Deregistered done!');
});

ProtocolRegistry.checkifExists('protocalgamma').then(console.log);
