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

    const bank = user.getBank();
    if (data.amount === constants.AMOUNT_ALL) {
        data.amount = bank;
    }

    if (data.amount <= 0) {
        return responses.error(message, `${ecoConfig.fail_symbol} Invalid amount to withdraw.`);
    }

    if (bank < data.amount) {
        return responses.error(message, `${ecoConfig.fail_symbol} You don't have enough ${ecoConfig.symbol} in the bank to withdraw.`);
    }

    user.addCash(data.amount);
    user.removeBankCash(data.amount);
    await user.save();

    const successEmbed = responses.success(message)
        .setDescription(`${ecoConfig.success_symbol} Withdrew ${ecoConfig.symbol}${data.amount} from your bank.`);

    return { embeds: [successEmbed] };
}


async function onError(message) {
    return responses.error(message, `${ecoConfig.fail_symbol}  Too few arguments given.\n\n` + "Usage:\n `withdraw <amount or all>`");
}

module.exports = {
    module: "economy",
    name: "withdraw",
    aliases: ["with", "wd"],
    usage: "<amount> | <all>",
    description: "Withdraws the specified amount of cash",
    process: onProcess,
    execute: onExecute,
    error: onError
}