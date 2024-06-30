// TODO: Implementation Needed
async function onProcess(message, args) {

}

async function onExecute(message, data) {

}

async function onError(message, data) {

}

module.exports = {
    module: "economy",
    name: "send",
    aliases: [],
    usage: "[ all | @user ] <item> <amount>",
    description: "Send items to a player in game",
    process: onProcess,
    execute: onExecute,
    error: onError
}