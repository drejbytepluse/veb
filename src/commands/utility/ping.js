const constants = require("@common/constants");
const responses = require("@common/responses");

async function onProcess(message, args) {
    const data = {
        timestamp: message.createdTimestamp
    };

    return { errorCode: constants.PROCESS_SUCCESS, data: data };
}

async function onExecute(message, data) {
    const responseTime = Date.now() - data.timestamp;

    const pingEmbed = responses.success(message)
    .setDescription(`Bot Response Time: **${responseTime < 0 ? 0 : responseTime}** ms`);

    return { embeds: [pingEmbed] };
}

async function onError() {}

module.exports = {
    module: "utility",
    name: "ping",
    aliases: [],
    usage: "",
    description: "Checks the bot's response time",
    process: onProcess,
    execute: onExecute,
    error: onError
}