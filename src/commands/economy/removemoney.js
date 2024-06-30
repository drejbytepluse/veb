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
        return { errorCode: constants.PROCESS_FAILED, data: "Too few arguments given. Check the command usage." };
    }

    return { errorCode: constants.PROCESS_SUCCESS, data: args };
}

async function onExecute(message, data) {
    const [type, member, amount] = data;
    const targetUser = message.mentions.members.first() || message.guild.members.cache.get(member);
    if (!targetUser) {
        return responses.error(message, `${ecoConfig.fail_symbol} User not found!`);
    }

    const user = await User.fromUserId(targetUser.id);

    switch (type) {
        case CashTypes.CASH:
            user.removeCash(amount);
            break;
        case CashTypes.BANK:
            user.removeBankCash(amount);
            break;
        default:
            return responses.invalidMoneyType();
    }

    await user.save();

    const successMessage = `${ecoConfig.success_symbol} Successfully removed ${ecoConfig.symbol}**${amount}** ${type === "cash" ? "cash" : "from bank"} from ${targetUser.displayName}'s account.`;
    const successRemoveEmbed = responses.success(message)
                                        .setDescription(successMessage);

    return { embeds: [successRemoveEmbed] };
}

async function onError(message, data) {
    return responses.error(message, `${ecoConfig.fail_symbol} ${data}`);
}

module.exports = {
    module: "economy",
    name: "remove-money",
    aliases: ["rm", "remove"],
    usage: "[cash | bank] <member> <amount>",
    description: "Removes the specified amount of money from the target user",
    process: onProcess,
    execute: onExecute,
    error: onError
}