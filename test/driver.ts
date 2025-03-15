import { RegisterOptions } from "..";

import path from "path";

import ProtocolRegistry from "..";

console.log("Registering...");
ProtocolRegistry.register({
  protocol: "testproto",
  command: `node ${path.join(__dirname, "./tester.js")} $_URL_`,
  override: true,
  terminal: true,
}).then(async () => {
  console.log("Successfully registered");
});

ProtocolRegistry.checkIfExists("testproto").then(console.log);