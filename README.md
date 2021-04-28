# Protocol-registry

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
    command: `node ${path.join(__dirname, './tester.js')} $_URL_`, // this will be executed with a extra argument %url from which it was initiated
    override: true, // Use this with caution as it will destroy all previous Registrations on this protocol
    terminal: true, // Use this to run your command inside a terminal
    script: false
}).then(async () => {
    console.log('Successfully registered');
});
```

## API

At present it supports :

### register(options, cb(err))

Options are mentioned in the above example, more details below.
If a valid callback is provided then it returns cb(err)
Otherwise it returns a promise.

#### Example

```js
const path = require('path');

const ProtocolRegistry = require('protocol-registry');

// Registers the Protocol
ProtocolRegistry.register({
    protocol: 'testproto',
    command: `node ${path.join(__dirname, './tester.js')} $_URL_`,
    terminal: true
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
    command: `node ${path.join(__dirname, './tester.js')} $_URL_`,
    terminal: true
},(err)=>{
    if(err){
        // do something
    }
})
// Example with callback

ProtocolRegistry.register({
    protocol: 'testproto',
    command: `node ${path.join(__dirname, './tester.js')} $_URL_`,
    terminal: false // Terminal is set to false
},(err)=>{
    if(err){
        // do something
    }
})
// The above code will run your command in background
// You wont be able to see any logs
// But if your program launches any UI / webpage / file will be visible

const commands=`cd path/to/destination
ls
node ${path.join(__dirname, './tester.js')} $_URL_
`;

ProtocolRegistry.register({
    protocol: 'testproto',
    command: commands,
    terminal: true, // Terminal is set to false
    script: true // This will save your commands in a script file and execute it when the protocol is hit.
},(err)=>{
    if(err){
        // do something
    }
})
// the above code will save your commands to a script file
// and execute it when ever required
// use this for multiline commands
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

### options
Register function accept the below mentioned option
| name           | types              | default      | details                                                                                                                                                                                                                                   |
| ---------------| ------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| protocol       | String (required)  | NA           | Only alphabets allowed. Your command will be executed when any url starting with this protocol is opened i.e. "myapp://test","testproto://abcd?mode=dev", etc. And please make sure that the protocol is unique to your application.      |
| command        | String (required)  | NA           | This command will be executed when the proctocol is called. **$\_URL\_** mentioned anywhere in your command will be replaced by the url by which it is initiated.                                                                            |
| override       | Boolean            | false        | If this is not true then you will get an error that protocol is already being used. But refrain from using this first check if the protocol exist or not then take action accordingly.                                                    |
| terminal       | Boolean            | false        | If this is set true then first a terminal is opened and then your command is executed inside it.otherwise your command is executed in background and no logs appear but if your program launches any UI / webpage / file will be visible. |
| script         | Boolean            | false        | If this is set true when your command is saved in a script and that script is executed. This option is recommended for multi-line commands and if your command uses any kind of quotes.                                                   |

## Supported platforms

- [`Windows`](https://g.co/kgs/bm4Z4b) - OS - Supported 
- [`linux`](https://g.co/kgs/xXAi4C) - OS - Supported
- [`MacOS`](https://g.co/kgs/k8yG4U) - OS - Supported with some anomalies mentioned below.

## MacOS Anomalies

### terminal: false

In MacOS if you don't launch the terminal it will run your command without logging in.

Thus you need to use absolute address of each command in your command string.

#### Example

Suppose you want to run :
```
$ node /path/to/index.js
```

Then first you need to find the path of node using the command below in terminal :
```
$ type node
> node is /usr/local/bin/node
```

Then replace the address of node in original comand.
So your final command will be :
```
$ /usr/local/bin/node /path/to/index.js
```

To check if your program is running in MacOS you can use the code below:
```js
if (process.platform === "darwin") {
    // running in MacOS do some thing
}
```
To run shell commands such as "type node" using nodeJS
please check the [`ShellJS documentation`](https://www.npmjs.com/package/shelljs#execcommand--options--callback)

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
