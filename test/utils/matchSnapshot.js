const { expect } = require('@jest/globals');
const constants = require('../config/constants');
const path = require('path');

exports.matchSnapshot = (content) => {
    if (content) {
        content = String(content)
            .replaceAll(
                path.join(__dirname, '../test runner.js'),
                'TEST_RUNNER_FILE'
            )
            .replaceAll(constants.osHomeDir, 'HOME_DIR');
    }
    expect(content).toMatchSnapshot();
};
