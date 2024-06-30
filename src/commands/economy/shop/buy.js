const constants = require("@common/constants");
const responses = require("@common/responses");
const ecoConfig = require("@config/economy");
const User = require("@models/User");
const Item = require("@models/Item");

async function onProcess(message, args) {
    const item = args[0];
    let quantity = args[1];

    if (!quantity) {
        quantity = 1;
    }

    if (!item) {
        return { errorCode: constants.PROCESS_FAILED, data: `Too few arguments given.\n\n` + "Usage:\n `buy <item> <amount>`" };
    }

    const getItem = await Item.getItemByName(item);
    if (!getItem) {
        return { errorCode: constants.PROCESS_FAILED, data: "Item not found." };
    }

    return { errorCode: constants.PROCESS_SUCCESS, data: { getItem, quantity, item } };
}

async function onExecute(message, data) {
    const { getItem, quantity, item } = data;

    if (getItem && quantity) {
        const totalCost = getItem.price * quantity;
        let user = await User.fromUserId(message.author.id);

        if (user.getCash() < totalCost) {
            return responses.error(message, `${ecoConfig.fail_symbol} Insufficient cash in your balance!`);
        }

        user.removeCash(totalCost);
        user.addItem(getItem, quantity);
        await user.save();

        const successPurchase = responses.success(message)
                                         .setDescription(`${ecoConfig.success_symbol} Purchase Successful!\n\n 📥 Item : ${item}`)

        return { embeds: [successPurchase] };
    } else {
        return responses.error(message, `${ecoConfig.fail_symbol} Failed to process command!`);
    }
}

async function onError(message, data) {
    console.log(data)
    return responses.error(message, `${ecoConfig.fail_symbol} ${data}`);
}

module.exports = {
    module: "economy",
    name: "buy",
    aliases: [],
    usage: "<item> <quantity>",
    description: "Buy command for shop",
    process: onProcess,
    execute: onExecute,
    error: onError
};
