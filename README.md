# protocol-registry

> Registers protocol like myapp:// to open your nodejs app from browsers. 

This is meant to be used in command-line tools and scripts, not in the browser.

#### Why?

- Actively maintained.
- Handles Cross Platform.
- Supports WSL paths to Windows apps.

## Install

```
$ npm install protocol-registry
```

## Usage

```js
const path = require('path');

const ProtocolRegistry = require('protocol-registry');

console.log('Registering...');
// Registers the Protocol
ProtocolRegistry.register({
    protocol: 'testproto', // set your app for testproto://**
    command: `node ${path.join(__dirname, './tester.js')}`, // this will be executed with a extra argument %url from which it was initiated
    override: true // Use this with caution as it will destroy all previous Registrations on this protocol
}).then(async () => {
    console.log('Successfully registered');
});
```

## API

At present it supports :

### register(options, cb(err))

Options are mentioned in the above example.
If a valid callback is provided then it returns cb(err)
Otherwise it returns a promise.

#### Example

```js
const path = require('path');

const ProtocolRegistry = require('protocol-registry');

// Registers the Protocol
ProtocolRegistry.register({
    protocol: 'testproto',
    command: `node ${path.join(__dirname, './tester.js')}`,
}).then(()=>{
    // do something
}).catch((e)=>{
    // do something
})
// Above will run tester.js when testproto://** is called as 
// node .../tester.js testproto://** 
// you can further parse the url to run in different modes
// As overide is not passed true it will throw an error is protocol already exists

ProtocolRegistry.register({
    protocol: 'testproto',
    command: `node ${path.join(__dirname, './tester.js')}`,
},(err)=>{
    if(err){
        // do something
    }
})
// Example with callback
```
### checkifExists(protocol)

Checks if the provided protocol already exists or not.
Returns a Promise which resolves in true or false.

#### Example

```js
const path = require('path');

const ProtocolRegistry = require('protocol-registry');

// Registers the Protocol
ProtocolRegistry.checkifExists('testproto').then((res)=>{
    console.log(res) // true or false
    // do something
}).catch((e)=>{
    // do something
})
// Above snippet will check it already some app uses the given protocol or not
```


## Supported platforms

- [`Windows`](https://g.co/kgs/bm4Z4b) - OS
- [`linux`](https://g.co/kgs/xXAi4C) - OS - Work in progress - Not supported yet.
- [`MacOS`](https://g.co/kgs/k8yG4U) - OS - Work in progress - Not supported yet.

## Contributors:

### Credits goes to these people: ✨

<table>
	<tr>
		<td>
            <a href="https://github.com/Shubham-Kumar-2000/protocol-registry/graphs/contributors">
                <img src="https://contrib.rocks/image?repo=Shubham-Kumar-2000/protocol-registry" />
            </a>
		</td>
	</tr>
</table>
