// TODO: Implementation Needed

async function onProcess(message, args) {
    // return { errorCode: constants.PROCESS_SUCCESS, data };
}

async function onExecute(message, data) {
    // const userId = message.author.id;
    // const hasCooldown = await redis.getKey(constants.CACHE_CHATCOOLDOWN, "chat-money", userId);
    // if (hasCooldown) {
    //     return { errorCode: constants.PROCESS_FAILED, data: "User is on cooldown." };
    // }

    // const user = await User.fromUserId(userId);
    // const income =
}

async function onError(message, data) {
}

module.exports = {
    module: "economy",
    name: "chat-money",
    aliases: ["cm", "chat-income"],
    usage: "",
    description: "Chat income command",
    process: onProcess,
    execute: onExecute,
    error: onError
}