const fs = require('fs');
const { join } = require('path');
const plist = require('plist');
if (process.argv.length < 4) throw new Error('App or protocol absent');

const mode =
    process.argv.length > 4
        ? process.argv[process.argv.length - 1]
        : 'protocol';

const protocol = process.argv[3];
const app = process.argv[2];
var obj = plist.parse(
    fs.readFileSync(join(app, './Contents/Info.plist')).toString()
);

if (mode === 'protocol') {
    obj['CFBundleIdentifier'] = 'com.protocol.registry.' + protocol;
    obj['CFBundleURLTypes'] = [
        {
            CFBundleURLName: 'URL : ' + protocol,
            CFBundleURLSchemes: [protocol]
        }
    ];
} else {
    obj['CFBundleIdentifier'] = 'com.protocol.registry.internal' + protocol;
}

fs.writeFileSync(join(app, './Contents/Info.plist'), plist.build(obj));
