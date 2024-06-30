const constants = require("@common/constants");
const responses = require('@common/responses');
const ecoConfig = require("@config/economy");
const CashTypes = require("@constants/CashTypes");
const User = require("@models/User");

async function onProcess(message, args) {
    const allowedRole = message.guild.roles.cache.find(role => role.name === "U-Admins");

    if (!allowedRole || !message.member.roles.cache.has(allowedRole.id)) {
        return { errorCode: constants.PROCESS_FAILED, data: "You don't have permission to use this command." };
    }

    if (args.length < 3) {
        return { errorCode: constants.PROCESS_FAILED, data: `Too few arguments given.\n\n` + "Usage:\n `add-money [cash | bank] <member> <amount>`" };
    }

    return { errorCode: constants.PROCESS_SUCCESS, data: args };
}

async function onExecute(message, data) {
    const [type, member, amount] = data;
    const targetUser = message.mentions.members.first() || message.guild.members.cache.get(member);
    if (!targetUser) {
        return { embeds: [responses.denied(message).setDescription(`${ecoConfig.fail_symbol} User not found!`)] };
    }

    const user = await User.fromUserId(targetUser.id);

    if (isNaN(amount)) {
        return { embeds: [responses.denied(message).setDescription(`${ecoConfig.fail_symbol} Invalid amount. Please specify a valid number.`)] };
    }

    const parsedAmount = parseFloat(amount);

    switch (type) {
        case CashTypes.CASH:
            user.addCash(parsedAmount);
            break;
        case CashTypes.BANK:
            user.addBankCash(parsedAmount);
            break;
        default:
            return responses.invalidMoneyType();
    }

    await user.save();

    const successMessage = `${ecoConfig.success_symbol} Successfully added ${ecoConfig.symbol}**${parsedAmount}** ${type === "cash" ? "cash" : "to bank"} to ${targetUser.displayName}'s account.`;
    const successAddEmbed = responses.success(message).setDescription(successMessage);

    return { embeds: [successAddEmbed] };
}

async function onError(message, data) {
    return responses.error(message, `${ecoConfig.fail_symbol} ${data}`);
}

module.exports = {
    module: "economy",
    name: "add-money",
    aliases: ["am", "add"],
    usage: "[cash | bank] <member> <amount>",
    description: "Adds the specified amount of money to the target user",
    process: onProcess,
    execute: onExecute,
    error: onError
}