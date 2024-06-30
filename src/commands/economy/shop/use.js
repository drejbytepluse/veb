const { fetchBindStatus } = require("@commands/game/bindstatus");
const axios = require("axios");
const constants = require("@common/constants");
const responses = require("@common/responses");
const ecoConfig = require("@config/economy");
const SendTypes = require("@constants/SendTypes");
const Item = require("@models/Item");
const User = require("@models/User");

async function onProcess(message, args) {
  const bindStatus = await fetchBindStatus(message);
  if (!bindStatus) {
    return { errorCode: constants.PROCESS_FAILED, data: "An error occurred while fetching bind status." };
  }

  const data = {
    userId: message.author.id,
    userGID: bindStatus.userId,
    itemName: args[0],
    quantity: parseInt(args[1]) || 1
  };

  if (!data.itemName) {
    return { errorCode: constants.PROCESS_FAILED, data: `${ecoConfig.fail_symbol}  Too few arguments given.\n\n` + "Usage:\n `use [item] <amount>`" }
  }

  if (!data.userGID) {
    return { errorCode: constants.PROCESS_FAILED, data: "You don't have any connected accounts!" };
  }

  return { errorCode: constants.PROCESS_SUCCESS, data };
}

async function onExecute(message, data) {
  const { userId, userGID, itemName, quantity } = data;
  let user = await User.fromUserId(userId);
  let inventory = user.getItems();
  // Map item names to VIP levels
  const vipLevels = {
    "MVP": 3,
    "VIP+": 2,
    "VIP": 1
  };
  const vipLevel = vipLevels[itemName];
  const vipDays = quantity * 7;

  if (!vipLevel) {
    return responses.error(message, "Invalid item name.");
  }

  if (!inventory[itemName] || inventory[itemName].quantity < quantity) {
    return responses.error(message, `You don't have enough 📦${itemName} items in your inventory.`);
  }

  user.removeItem(itemName, quantity);
  await user.save();

  const postData = {
    sendType: SendTypes.USER,
    userIds: [`${userGID}`],
    title: "Item Usage Success!",
    content: `You have used ${quantity} ${itemName}(s) from your Discord account inventory for ${vipDays} days!`,
    attachments: [{ "type": 3, "vipLevel": vipLevel, "vipDays": vipDays }]
  };

  try {
    await axios.post(`${constants.INNER_API}${constants.MAIL_ENDPOINT}`, postData, {
      params: authParams,
      headers: { "Content-Type": "application/json", "User-Agent": "discord-bot/1.0" }
    });
  } catch (error) {
    console.error("Error sending API post request:", error);
    return responses.error(message, "Failed to send API post request.");
  }

  const useSuccessEmbed = responses.success(message)
    .setDescription(`${ecoConfig.success_symbol}Successfully used ${quantity} 📦**${itemName}** for ${vipDays} days!\n\nPlease check your in-game Mail!`);

  return { embeds: [useSuccessEmbed] };
}

async function onError(message, data) {
  return responses.error(message, `${ecoConfig.fail_symbol} ${data}`);
}

module.exports = {
  module: "economy",
  name: "use",
  aliases: [],
  usage: "use <ingame-item> <amount>",
  description: "Use the item you have in your inventory",
  process: onProcess,
  execute: onExecute,
  error: onError
};
