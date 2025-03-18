const constants = require('../../src/config/constants');

const testConstants = {
    wssPort: 8000,
    checkIntegration: process.env.TEST_INTEGRATION === 'TRUE',
    jestTimeOut: 5000,
    ...constants
};

if (testConstants.checkIntegration) {
    testConstants.jestTimeOut = 30000;
}

module.exports = testConstants;
