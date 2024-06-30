// TODO: Implementation Needed
async function onProcess(message, args) {

}

async function onExecute(message, data) {

}

async function onError(message, data) {
}

module.exports = {
    module: "economy",
    name: "collect-income",
    aliases: ["collect"],
    usage: "",
    description: "Collect your daily income from roles",
    process: onProcess,
    execute: onExecute,
    error: onError
}