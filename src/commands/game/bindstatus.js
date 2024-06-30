const axios = require("axios");
const auth = require("@common/auth");
const constants = require("@common/constants");
const logger = require("@common/logger");
const responses = require("@common/responses");
const ecoConfig = require("@config/economy");
const iconConfig = require("@config/icons");

async function fetchStatusData(message) {
    let bindStatusResponse = null;
    const authParams = await auth.createAuthParams();

    try {
        bindStatusResponse = await axios.get(`${constants.INNER_API}${constants.BIND_ENDPOINT}`, {
            params: { connectId: message.author.id, ...authParams },
            headers: { "Content-Type": "application/json", "User-Agent": "discord-bot/1.0" }
        });
    } catch (err) {
        logger.error("Error fetching bind status:", err);
        return null;
    }
    console.log(bindStatusResponse.data)
    return bindStatusResponse.data.data;
}

async function fetchUserInfo(userId) {
    let userInfoResponse = null;
    const authParams = await auth.createAuthParams();

    try {
        userInfoResponse = await axios.get(`${constants.INNER_API}${constants.INFO_ENDPOINT}`, {
            params: { userId, ...authParams },
            headers: { "Content-Type": "application/json", "User-Agent": "discord-bot/1.0" }
        });
    } catch (err) {
        logger.error("Error fetching user data:", err);
        return null;
    }
    console.log(userInfoResponse.data)
    return userInfoResponse.data.data;
}

async function onProcess(message, args) {
    const statusData = await fetchStatusData(message);
    if (!statusData) {
        return { errorCode: constants.PROCESS_FAILED, data: "An error occurred while fetching bind status." }
    }

    if (!statusData.userId) {
        return { errorCode: constants.PROCESS_FAILED, data: "You don't have any connected accounts!" };
    }

    const userInfo = await fetchUserInfo(statusData.userId);
    if (!userInfo) {
        return { errorCode: constants.PROCESS_FAILED, data: "An error occurred while fetching user data." };
    }

    return { errorCode: constants.PROCESS_SUCCESS, data: { userId: statusData.userId, userInfo: userInfo } };
}

async function onExecute(message, data) {
    const userInfo = data.userInfo;
    console.log(userInfo);
    const connectedMessage = `${ecoConfig.success_symbol} Your account is connected to Blockman Forge!`;
    const isValidUrl = /^(ftp|http|https):\/\/[^ "]+$/.test(userInfo.picUrl);
    const iconUrl = isValidUrl ? userInfo.picUrl : iconConfig.defaultAvatar;
    console.log(iconUrl); // Use default avatar if picUrl is not a valid URL
    const details = userInfo.details ?? "Empty";
    const gender = userInfo.sex === 1 ? "Male" : (userInfo.sex === 2 ? "Female" : "");

    const connectedEmbed = responses.success(message)
        .setDescription(connectedMessage)
        .setThumbnail(`${iconUrl}`)
        if (userInfo.nickName !== '') {
            connectedEmbed.addField("Nickname:", userInfo.nickName);
        }
        if (data.userId !== '') {
            connectedEmbed.addField("ID:", data.userId, true);
        }
        if (gender !== '') {
            connectedEmbed.addField("Gender:", gender, true);
        }
        if (details !== '') {
            connectedEmbed.addField("Details:", details);
        }
        connectedEmbed.setTimestamp();

    return { embeds: [connectedEmbed] };
}

async function onError(message, data) {
    return responses.error(message, `${ecoConfig.fail_symbol} ${data}`);
}

module.exports = {
    module: "game",
    name: "bind-status",
    aliases: ["binding"],
    usage: "",
    description: "Checks the sender's in-game account binding status",
    process: onProcess,
    execute: onExecute,
    error: onError,
    fetchBindStatus: fetchStatusData
}