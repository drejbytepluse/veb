const constants = require("@common/constants");
const responses = require("@common/responses");
const ecoConfig = require("@config/economy");
const redis = require("@common/redis");
const User = require("@models/User");

async function onProcess(message) {
    const userId = message.author.id;
    const hasCooldown = await redis.getKey(constants.CACHE_COOLDOWN, "rob", userId);

    if (hasCooldown) {
        const cooldownSecs = await redis.getExpireDate(constants.CACHE_COOLDOWN, "rob", userId);
        const cooldownMins = Math.ceil(cooldownSecs / 60);
        return { errorCode: constants.PROCESS_FAILED, data: cooldownMins };
    }

    return { errorCode: constants.PROCESS_SUCCESS, data: { userId } };
}

async function onExecute(message) {
    const robConfig = ecoConfig.commands["rob"];
    const mentionedUser = message.mentions.users.first();
    const victim = await User.fromUserId(mentionedUser.id);
    const victimCash = await victim.getCash();
    const robSuccess = Math.random() < robConfig.rob_success_rate / 100;
    const robber = await User.fromUserId(message.author.id);

    if (!mentionedUser) {
        return responses.error(message, `${ecoConfig.fail_symbol} You need to mention a user to rob!`);
    }

    if (victimCash <= 0) {
        return responses.error(message, `${ecoConfig.fail_symbol} The victim has no cash to rob!`);
    }

    await redis.setKey({ key: constants.CACHE_COOLDOWN, params: ["rob", mentionedUser.id] }, "true", robConfig.delay);

    if (robSuccess) {
        const robAmount = Math.floor(Math.random() * (robConfig.max_gain_amount - robConfig.min_gain_amount + 1)) + robConfig.min_gain_amount;

        robber.addCash(robAmount);
        await robber.save();

        victim.removeCash(robAmount);
        await victim.save();

        const successMessage = robConfig.win_phrases[Math.floor(Math.random() * robConfig.win_phrases.length)];
        const successEmbed = responses.success(message)
                                      .setDescription(`${ecoConfig.success_symbol} ${successMessage} ${ecoConfig.symbol} +${robAmount}`);
                                      
        return { embeds: [successEmbed] };
    }

    const loseAmount = Math.floor(Math.random() * (robConfig.max_lose_amount - robConfig.min_lose_amount + 1)) + robConfig.min_lose_amount;

    robber.removeCash(loseAmount);
    await robber.save();

    const failMessage = robConfig.lose_phrases[Math.floor(Math.random() * robConfig.lose_phrases.length)];
    return responses.error(message, `${ecoConfig.fail_symbol} ${failMessage} ${ecoConfig.symbol} -${loseAmount}`);
}

async function onError(message, data) {
    return responses.error(message, `${ecoConfig.cooldown_symbol} You cannot attempt to rob another member for ${data} minutes`);
};

module.exports = {
    module: "economy",
    name: "rob",
    aliases: [],
    usage: "@username",
    description: "Robs the target user with a chance of getting caught (Don't steal, it's bad!)",
    process: onProcess,
    execute: onExecute,
    error: onError
}