const constants = require("@common/constants");
const responses = require('@common/responses');
const ecoConfig = require("@config/economy");
const redis = require("@common/redis");
const User = require("@models/User");

async function onProcess(message, args) {
    const data = {
        userId: message.author.id
    };

    const hasCooldown = await redis.getKey(constants.CACHE_COOLDOWN, "crime", data.userId);
    if (hasCooldown) {
      const cooldownSecs = await redis.getExpireDate(constants.CACHE_COOLDOWN, "crime", data.userId);
      const cooldownMins = Math.ceil(cooldownSecs / 60);
      return { errorCode: constants.PROCESS_FAILED, data: cooldownMins  };
    }

    return { errorCode: constants.PROCESS_SUCCESS, data: data };
}

async function onExecute(message, data) {
    const user = await User.fromUserId(data.userId);
    const crimeConfig = ecoConfig.commands["crime"];
    const success = Math.random() * 100 < crimeConfig.crime_success_rate;

    let revenue;
    let description;

    await redis.setKey({ key: constants.CACHE_COOLDOWN, params: ["crime", data.userId] }, "true", crimeConfig.delay);

    if (success) {
        revenue = Math.floor(Math.random() * (crimeConfig.max_revenue - crimeConfig.min_revenue + 1)) + crimeConfig.min_revenue;
        description = `${ecoConfig.success_symbol} ${crimeConfig.win_phrases[Math.floor(Math.random() * crimeConfig.win_phrases.length)]} ${ecoConfig.symbol} +${revenue}.`;

        user.addCash(revenue);
        await user.save();

        const successEmbed = responses.success(message)
                                      .setDescription(description);

        return { embeds: [successEmbed] };
    } else {
        revenue = Math.floor(Math.random() * (crimeConfig.max_lose_amount - crimeConfig.min_lose_amount + 1)) + crimeConfig.min_lose_amount;
        description = `${ecoConfig.fail_symbol} ${crimeConfig.lose_phrases[Math.floor(Math.random() * crimeConfig.lose_phrases.length)]} ${ecoConfig.symbol} -${revenue}.`;

        user.removeCash(revenue);
        await user.save();

        return responses.error(message, description);
    }
}

async function onError(message, data) {
    return responses.error(message, `${ecoConfig.cooldown_symbol} You cannot commit a crime for ${data} minutes`);
}

module.exports = {
    module: "economy",
    name: "crime",
    aliases: [],
    usage: "",
    description: "Commits a crime on your behalf. Bad!",
    process: onProcess,
    execute: onExecute,
    error: onError
}