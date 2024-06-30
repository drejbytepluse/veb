const constants = require("@common/constants");
const responses = require('@common/responses');
const ecoConfig = require("@config/economy");
const User = require("@models/User");

async function onProcess(message, args) {
    const data = {};

    data.targetUser = message.author;
    if (message.mentions.users.size > 0) {
        data.targetUser = message.mentions.users.first();
    }

    return { errorCode: constants.PROCESS_SUCCESS, data: data };
}

async function onExecute(message, data) {
    const user = await User.fromUserId(data.targetUser.id);
    const cash = user.getCash();
    const bank = user.getBank();
    const total = cash + bank;

    const balanceEmbed = responses.info(message)
        .setAuthor({ name: data.targetUser.username, iconURL: data.targetUser.avatarURL() })
        .addFields(
            { name: 'Cash:', value: `${ecoConfig.symbol}${cash}`, inline: true },
            { name: 'Bank:', value: `${ecoConfig.symbol}${bank}`, inline: true },
            { name: 'Total:', value: `${ecoConfig.symbol}${total}`, inline: true },
        );

    return { embeds: [balanceEmbed] };
}

async function onError(message, data) {}

module.exports = {
    module: "economy",
    name: "balance",
    aliases: ["bal"],
    usage: "[user]",
    description: "Shows one's balance if an user is specified, defaults to the sender's balance",
    process: onProcess,
    execute: onExecute,
    error: onError
}