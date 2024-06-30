async function onProcess() {}

async function onExecute() {}

async function onError() {}

module.exports = {
  module: "economy",
  name: "chicken-fight",
  aliases: ["cf"],
  usage: "",
  description: "Chickens!... Assemble...  Rahhh!",
  process: onProcess,
  execute: onExecute,
  error: onError
}