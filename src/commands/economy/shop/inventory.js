const constants = require("@common/constants");
const responses = require("@common/responses");
const Item = require("@models/Item");

async function onProcess(message, args) {
  const data = {
    userId: message.author.id,
    userName: message.author.globalName,
  };

  return { errorCode: constants.PROCESS_SUCCESS, data };
}

async function onExecute(message, data) {
  let inventory = await Item.getInventory(data.userId);

  if (typeof inventory === 'string') {
    try {
      inventory = JSON.parse(inventory);
    } catch (error) {
      console.error("Error parsing inventory data:", error);
    }
  }

  const inventoryEmbed = responses.success(message)
                                  .setTitle(`${data.userName}'s Inventory!`);
  for (const itemName in inventory) {
    const itemData = inventory[itemName];
    inventoryEmbed.addFields({ name: `📦${itemName}`, value: `Quantity: [ ${itemData.quantity}x ]` });
  }

  return { embeds: [inventoryEmbed] };
}

async function onError(message, data) {}

module.exports = {
  module: "economy",
  name: "inventory",
  aliases: ["inv"],
  usage: "",
  description: "Inventory command for user",
  process: onProcess,
  execute: onExecute,
  error: onError
};
