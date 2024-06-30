const constants = require("@common/constants");
const responses = require("@common/responses");
const ecoConfig = require("@config/economy");
const redis = require("@common/redis");
const User = require("@models/User");

async function onProcess(message, args) {
    const data = {
        userId: message.author.id,
    };

    const hasCooldown = await redis.getKey(constants.CACHE_COOLDOWN, "work", data.userId);
    if (hasCooldown) {
        const cooldownSecs = await redis.getExpireDate(constants.CACHE_COOLDOWN, "work", data.userId);
        const cooldownMins = Math.ceil(cooldownSecs / 60);
        return { errorCode: constants.PROCESS_FAILED, data: cooldownMins };
    }

    return { errorCode: constants.PROCESS_SUCCESS, data: data };
}

async function onExecute(message, data) {
    const user = await User.fromUserId(data.userId);
    const workConfig = ecoConfig.commands["work"];
    const revenue = Math.floor(Math.random() * (workConfig.max_revenue - workConfig.min_revenue + 1)) + workConfig.min_revenue;
    const randomPhrase = workConfig.win_phrases[Math.floor(Math.random() * workConfig.win_phrases.length)];

    user.addCash(revenue);
    await user.save();

    await redis.setKey({ key: constants.CACHE_COOLDOWN, params: ["work", data.userId] }, "true", workConfig.delay);

    const workEmbed = responses.success(message)
        .setDescription(`${ecoConfig.success_symbol} ${randomPhrase} ${ecoConfig.symbol}${revenue}.`);

    return { embeds: [workEmbed] };
}

async function onError(message, data) {
    return responses.error(message, `${ecoConfig.cooldown_symbol} You cannot work for ${data} minutes`);
}

module.exports = {
    module: "economy",
    name: "work",
    aliases: [],
    usage: "",
    description: "Work! Work! Work! Rewards you with some cash after!",
    process: onProcess,
    execute: onExecute,
    error: onError,
};
