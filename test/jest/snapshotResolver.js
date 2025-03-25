const path = require('path');

module.exports = {
    resolveSnapshotPath: (testPath, snapshotExtension) => {
        return path.resolve(
            path.dirname(testPath),
            '__snapshots__',
            process.platform,
            path.basename(testPath) + snapshotExtension
        );
    },
    resolveTestPath: (snapshotPath, snapshotExtension) => {
        const testPath = path.join(
            path.dirname(snapshotPath),
            '../../',
            path.basename(snapshotPath)
        );
        return testPath.slice(0, -snapshotExtension.length);
    },
    testPathForConsistencyCheck: path.join(__dirname, '../driver.test.js')
};
