import { RegisterOptions } from "..";

import path from "path";

import ProtocolRegistry from "..";

console.log("Registering...");
ProtocolRegistry.register({
  protocol: "testproto",
  command: `node ${path.join(__dirname, "./tester.js")} $_URL_`,
  override: true,
  terminal: true,
  script: true,
}).then(async () => {
  console.log("Successfully registered");
});

ProtocolRegistry.checkifExists("testproto").then(console.log);