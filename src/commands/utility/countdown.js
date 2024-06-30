// TODO: Implementation Needed
async function onProcess(message, args) {

}

async function onExecute(message, data) {

}

async function onError(message, data) {
    return responses.error(message, `${ecoConfig.fail_symbol} ${data}`);
}

module.exports = {
    module: "utility",
    name: "countdown",
    aliases: ["cd", "count"],
    usage: "-create <channel-name> <TimerTitle> <days>",
    description: "Sets the countdown",
    process: onProcess,
    execute: onExecute,
    error: onError
};