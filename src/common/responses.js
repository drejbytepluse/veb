const { EmbedBuilder } = require("discord.js");

function error(message, content) {
	return {
        embeds: [
            new EmbedBuilder().setColor(0x8b0000)
                              .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
                              .setDescription(content)
        ]
    };
}

function success(message) {
    return new EmbedBuilder().setColor(0x00FF99)
                             .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
}

function info(message) {
    return new EmbedBuilder().setColor(0x4CAAE4)
                             .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
}

function invalidMoneyType() {
    return responses.error(message, `${ecoConfig.fail_symbol} Invalid money type. Please specify "cash" or "bank"`);
}

function moduleNotFound() {
    return responses.error(message, "The module or command was not found");
}

module.exports = {
    error: error,
    success: success,
    info: info,
    invalidMoneyType: invalidMoneyType,
    moduleNotFound: moduleNotFound
}