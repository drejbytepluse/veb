const constants = require("@common/constants");
const responses = require("@common/responses");
const ecoConfig = require("@config/economy");
const User = require("@models/User");

async function onProcess(message, args) {
    const data = { userId: message.author.id };

    if (args.length == 0) {
        return { errorCode: constants.PROCESS_FAILED };
    }

    if (args[0].toLowerCase() == "all") {
        data.amount = constants.AMOUNT_ALL;
    } else if (isNaN(args[0])) {
        return { errorCode: constants.PROCESS_FAILED }
    } else {
        data.amount = parseInt(args[0]);
    }

    return { errorCode: constants.PROCESS_SUCCESS, data: data };
}

async function onExecute(message, data) {
    const user = await User.fromUserId(data.userId);

    const cash = user.getCash();
    if (data.amount === constants.AMOUNT_ALL) {
        data.amount = cash;
    }

    if (data.amount <= 0) {
        return responses.error(message, `${ecoConfig.fail_symbol} Invalid amount to deposit.`);
    }

    if (cash < data.amount) {
        return responses.error(message, `${ecoConfig.fail_symbol} You don't have enough ${ecoConfig.symbol} to deposit.`);
    }

    user.removeCash(data.amount);
    user.addBankCash(data.amount);
    await user.save();

    const successEmbed = responses.success(message)
        .setDescription(`${ecoConfig.success_symbol} Deposited ${ecoConfig.symbol}${data.amount} into your bank.`);

    return { embeds: [successEmbed] };
}


async function onError(message) {
    return responses.error(message, `${ecoConfig.fail_symbol}  Too few arguments given. Check the command usage.`);
}

module.exports = {
    module: "economy",
    name: "deposit",
    aliases: ["dep", "dp"],
    usage: "<amount> | <all>",
    description: "Deposit the specified amount of cash to the sender's bank",
    process: onProcess,
    execute: onExecute,
    error: onError
}