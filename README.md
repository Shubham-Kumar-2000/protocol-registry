# Protocol-registry

[![License](https://img.shields.io/github/license/Shubham-Kumar-2000/protocol-registry)](https://github.com/Shubham-Kumar-2000/protocol-registry)
[![Latest version](https://img.shields.io/npm/v/protocol-registry)](https://www.npmjs.com/package/protocol-registry)
[![Known Vulnerabilities](https://snyk.io/test/github/Shubham-Kumar-2000/protocol-registry/badge.svg)](https://snyk.io/test/github/Shubham-Kumar-2000/protocol-registry)
![Nodejs workflow status](https://github.com/Shubham-Kumar-2000/protocol-registry/actions/workflows/node.js.yml/badge.svg?branch=main)
[![Installs](https://img.shields.io/npm/dt/protocol-registry)](https://www.npmjs.com/package/protocol-registry)
[![Node version](https://img.shields.io/node/v/protocol-registry.svg?style=flat)](https://www.npmjs.com/package/protocol-registry)

> Registers protocols like:- yourapp:// or myapp:// etc. to open your nodejs app from different browsers.

This is meant to be used in command-line tools and scripts, not in the browser.

<p align="center">
    <br>
	<img alt="Coding" width="500" src="https://user-images.githubusercontent.com/41825906/116656011-96d46080-a9a9-11eb-9107-03b2e58f94a3.gif" />
    <br>
</p>

#### Why?

- Actively maintained.
- Handles Cross Platform.
- Supports WSL paths to Windows apps.
- Handles multi-line commands.
- Works on electron.

## Install

```
$ npm install protocol-registry
```

## Usage

```js
const path = require("path");

const ProtocolRegistry = require("protocol-registry");

console.log("Registering...");

// Registers the Protocol
ProtocolRegistry.register(
    'testproto', // sets protocol for your command , testproto://**
    `node "${path.join(__dirname, './tester.js')}" "$_URL_"`, // this will be executed where $_URL_ will have actual url value
    {
        override: true, // Use this with caution as it will destroy all previous Registrations on this protocol
        terminal: true, // Use this to run your command inside a terminal
        appName: 'my-custom-app-name' // Custom app name.
    }
).then(async () => {
    console.log('Successfully registered');
});
```

<details>
    <summary>
        <b>
            Note : Refrain from using query to get data from the url, <i> click here to view some alternatives. </i> 
        </b>
    </summary>
<br/>

##### Alternative 1

Instead you can use routing params to get the data from the url, described in the example below:

<b> Original Way : </b> `testproto://test?a=b&b=c`

<b> Must use : </b> `testproto://test/-a/b/-b/c`
<br/>As it is more CLI friendly.
<br/>
<b> Example : </b>

```js
const url = "testProto://-l/Hindi";
const { ArgumentParser } = require("argparse");
const { version } = require("./package.json");

const protocols = ["testProto", "test"];
const defaultProtocol = "testProto";
const parser = new ArgumentParser({
  description: "Example",
});

parser.add_argument("-v", "--version", { action: "version", version });
parser.add_argument("mode", {
  type: String,
  choices: protocols,
  nargs: "?",
  default: defaultProtocol,
});
parser.add_argument("-l", "--lang", {
  help: "Choose the language.",
  choices: ["Hindi", "English"],
});
const data = parser.parse_args(url.split(/:\/\/|[\/]/g));
console.log(JSON.stringify(data, null, 4));
// {
//    "mode": "testProto",
//    "lang": "Hindi"
// }
```
##### Alternative 2

Use can use base64 encryption to transmit data and decode it there.

```js
const encode = (str) => Buffer.from(str).toString('base64');
const decode = (str) => Buffer.from(str, 'base64').toString();

const protocol = 'testproto://';
const encoded = encode(JSON.stringify({ mode: 'testProto', lang: 'Hindi' }));
const url = `${protocol}${encoded}`;
console.log(url);
// testproto://eyJtb2RlIjoidGVzdFByb3RvIiwibGFuZyI6IkhpbmRpIn0=

const data = url.split('://')[1];
const decoded = JSON.parse(decode(data));
console.log(decoded);
// { mode: 'testProto', lang: 'Hindi' }

```

</details>

#### On Electron :

On electron, you can use the protocol-registry to open your app through custom protocols.

Note : Electron's built-in `app.setAsDefaultProtocolClient` is recommended to be used in production but as it has some issues in development you can use `ProtocolRegistry.register` instead while developing.

```js
const dev = require("electron-is-dev");
const ProtocolRegistry = require("protocol-registry")

if (dev) {
    ProtocolRegistry.register(
        'testproto',
        `"${process.execPath}" "${path.resolve(process.argv[1])}" "$_URL_"`,
        {
            override: true,
            script: true,
            terminal: dev
        }
    )
        .then(() => console.log('Successfully registered'))
        .catch(console.error);
} else {
    if (!app.isDefaultProtocolClient('testproto')) {
        app.setAsDefaultProtocolClient('testproto');
    }
}
```

## API

At present it supports :

### register(protocol, command, options={})

Registers a protocol and returns a promise.

#### params

Register function accept the below mentioned params
| name | types | default | details |
| ---------------| ------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| protocol | String (required) | NA | Only alphabets allowed. Your command will be executed when any url starting with this protocol is opened i.e. "myapp://test","testproto://abcd?mode=dev", etc. And please make sure that the protocol is unique to your application. |
| command | String (required) | NA | This command will be executed when the protocol is called. **$\_URL\_** mentioned anywhere in your command will be replaced by the url by which it is initiated. Make sure to wrap it with double quotes for safe parsing. Avoid using single quotes as they don't allow for variable expansion. |
| options.override | Boolean | false | If this is not true, then you will get an error that protocol is already being used. So, first check if the protocol exist or not then take action accordingly (Refrain from using it). |
| options.terminal | Boolean | false | If this is set true, then first a terminal is opened and then your command is executed inside it.otherwise your command is executed in background and no logs appear but if your program launches any UI / webpage / file, it will be visible. |
| options.appName | String | `url-${protocol}` | This is the name of the app file that will be created. |


#### Example

```js
const path = require("path");

const ProtocolRegistry = require("protocol-registry");

// Registers the Protocol
ProtocolRegistry.register(
  "testproto",
  `node "${path.join(__dirname, "./tester.js")}" "$_URL_"`, 
  {
    terminal: true,
  }
)
  .then(() => {
    // do something
  })
  .catch((e) => {
    // do something
  });
// Above will run tester.js when testproto://** is called as
// node .../tester.js testproto://**
// you can further parse the url to run in different modes
// As override is not passed true it will throw an error is protocol already exists

ProtocolRegistry.register(
  "testproto",
  `node "${path.join(__dirname, "./tester.js")}" "$_URL_"`,
  {
    terminal: false, // Terminal is set to false
  }
);
// The above code will run your command in background
// You wont be able to see any logs
// But if your program launches any UI / webpage / file will be visible

const commands = `cd path/to/destination
ls
node "${path.join(__dirname, "./tester.js")}" "$_URL_"
`;

ProtocolRegistry.register(
  "testproto",
  commands,
  {
    terminal: true, // Terminal is set to false
    appName: 'My app 007' // This is the name of the app file that will be created.
  }
);
// the above code will save your commands to a custom app file
// and execute it when ever required
```
### checkIfExists(protocol)

Checks if the provided protocol already exists or not.
Returns a Promise which resolves in true or false.

#### params

CheckIfExists function accept the below mentioned params
| name | types | default | details |
| ---------------| ------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| protocol | String (required) | NA | The protocol for which default app needs to be checked. |

#### Example

```js
const path = require("path");

const ProtocolRegistry = require("protocol-registry");

ProtocolRegistry.checkIfExists("testproto")
  .then((res) => {
    console.log(res); // true or false
    // do something
  })
  .catch((e) => {
    // do something
  });
```

### getDefaultApp(protocol)

Fetches the path of the default registered app.
Returns a Promise which resolves in String or null.

NOTE: In case of windows it returns the registry path instead of app path.

#### params

GetDefaultApp function accept the below mentioned params
| name | types | default | details |
| ---------------| ------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| protocol | String (required) | NA | The protocol for which default app needs to be fetched. |

#### Example

```js
const path = require("path");

const ProtocolRegistry = require("protocol-registry");

ProtocolRegistry.getDefaultApp("testproto")
  .then((res) => {
    console.log(res); // AppPath or null
    // do something
  })
  .catch((e) => {
    // do something
  });
```

### deRegister(protocol, options={})

Removes registration of the default app associated with the given protocol.

#### params

De-Register function accept the below mentioned params
| name | types | default | details |
| ---------------| ------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| protocol | String (required) | NA | The protocol for which default app registration needs to be removed. |
| options.force | Boolean | false | In some cases just removing the registration is not possible thus removing the app itself is the only option. Thus when force is used it will remove the default app itself. **This is not required for the apps registered using this module.** Below is the more detailed explanation. |

#### force : true

This is only applicable for apps that are not registered through this module.
In some cases just removing the registration is not possible thus removing the app itself is the only option. Thus when force is used it will remove the default app itself.

- MacOS: Sometime in MacOS, `App Management` permission is required to modify other apps in the system. Thus without force app update may fail. But if the app is registered through this module then it directly deletes the app because we know it doesn't have any other purposes.
- Windows: In windows there is no effect of this operator.
- Linux: By default it only removes the mime handlers from the desktop file but if force is true or if the app is registered through this module then it deletes the registered desktop file.

#### Example

```js
const path = require("path");

const ProtocolRegistry = require("protocol-registry");

// DeRegister the Protocol
ProtocolRegistry.deRegister('testproto', {
  force: false
})
  .then(() => {
    // do something
  })
  .catch((e) => {
    // do something
  });
// Above snippet will deregister the default app associated with the protocol : testproto
```

## Supported platforms

- [`Windows`](https://g.co/kgs/bm4Z4b) - OS - Supported
- [`linux`](https://g.co/kgs/xXAi4C) - OS - Supported
- [`MacOS`](https://g.co/kgs/k8yG4U) - OS - Supported

## MacOS Anomalies

### terminal: false

In MacOS if you don't launch the terminal it will run your command without logging in. But we still go head and log you in using your default system `SHELL` i.e. `zsh` or `bash`. Also we preserve the current `PATH` while protocol execution.

But still in some cases `PATH` added after the the registration may not work. Thus make sure all your commands are working before registering the protocol or use their absolute path.

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
<p align="center">
  <h2 align="center">Visitor's Count <img align="center" src="https://profile-counter.glitch.me/Shubham-Kumar-2000.protocol-registry/count.svg" alt="Visitor Count" /></h2>
</p>
