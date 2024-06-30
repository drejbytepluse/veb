// TODO: Implementation Needed
async function onProcess(message, args) {

}

async function onExecute(message, data) {

}

async function onError(message, data) {
}

module.exports = {
    module: "economy",
    name: "role-income",
    aliases: ["role-i", "income"],
    usage: "add <role> <cash | bank> <amount> <interval> [<channel> <message>]",
    description: "Role income for day to day",
    process: onProcess,
    execute: onExecute,
    error: onError
}