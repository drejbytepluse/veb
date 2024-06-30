const { fetchBindStatus } = require("@commands/game/bindstatus");
const constants = require("@common/constants");
const responses = require("@common/responses");
const ecoConfig = require("@config/economy");
const SendTypes = require("@constants/SendTypes");
const redis = require("@common/redis");
const auth = require("@common/auth");
const axios = require("axios");
const User = require("@models/User");

async function onProcess(message, args) {
    const bindStatus = await fetchBindStatus(message);
    const vaultStatus = await redis.getKey(constants.VAULT_STATUS, "enable");
    const haveUsed = await redis.getKey(constants.TRANSFER_CD, data.userId);
    const data = {
        userId: message.author.id,
        userGID: bindStatus.userId
    };

    if (vaultStatus === "false") {
        return { errorCode: constants.PROCESS_FAILED, data: "Vault is Disabled by Admins!" };
    }

    if (!data.userGID) {
        return { errorCode: constants.PROCESS_FAILED, data: "You don't have any connected accounts!" };
    }

    if (haveUsed === "true") {
        return { errorCode: constants.PROCESS_FAILED, data: "This command can't be used more than 1 time!" };
    }

    return { errorCode: constants.PROCESS_SUCCESS, data };
}

async function onExecute(message, data) {
    try {
        const user = await User.fromUserId(data.userId);
        const { cash, bank } = await User.fromUserId(data.userId).then(user => ({ cash: user.getCash(), bank: user.getBank() }));
        const total = cash + bank;
        const authParams = await auth.createAuthParams();
        const coversionRatio = 0.075; // 75 in-game bluecubes for every 1000 cash
        const minTransfer = 100;
        const maxTransfer = 100000;
        const maxExceed = Math.min(maxTransfer, total);
        const transferAmount = Math.round(maxExceed * coversionRatio);

        const postData = {
            sendType: SendTypes.USER,
            userIds: [`${data.userGID}`],
            title: "Transfer Success!",
            content: "You have been transferred currencies from your Discord account to here!",
            attachments: [{ type: 1, currency: 1, quantity: transferAmount }]
        };

        if (total < minTransfer) {
            return { errorCode: constants.PROCESS_FAILED, data: `You need at least ${minTransfer}${ecoConfig.symbol} to transfer!` }
        }

        await axios.post(`${constants.INNER_API}${constants.MAIL_ENDPOINT}`, postData, {
            params: authParams,
            headers: { "Content-Type": "application/json", "User-Agent": "discord-bot/1.0" }
        });

        if (maxExceed <= cash) {
            user.setCash(cash - maxExceed);
            user.setBank(bank)
        } else {
            user.setCash(0);
            user.setBank(bank - (maxExceed - cash));
        }

        await user.save();

        await redis.setKey({ key: constants.TRANSFER_CD, params: [data.userId] }, "true");

        return { embeds: [responses.success(message).setDescription(`${ecoConfig.success_symbol} Transfer Success!\n\n **Transferred**\n ${ecoConfig.symbol}${total} ---> ${ecoConfig.ig_currency}${transferAmount}\n\n Please check your in-game Mail.`)] };
    } catch (err) {
        console.error(err);
        return { errorCode: constants.PROCESS_FAILED, data: "There was a problem while transferring." };
    }
}

async function onError(message, data) {
    return responses.error(message, `${ecoConfig.fail_symbol} ${data}`);
}

module.exports = {
    module: "economy",
    name: "transfer",
    aliases: [],
    usage: "",
    description: "Transfer everything from discord to the game",
    process: onProcess,
    execute: onExecute,
    error: onError
};
