const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const constants = require("@common/constants");
const responses = require("@common/responses");
const ecoConfig = require("@config/economy");
const iconConfig = require("@config/icons");
const Item = require("@models/Item");

const LIST_PER_PAGE = 5;

async function onProcess() {
    let page = 1;
    return { errorCode: constants.PROCESS_SUCCESS, data: { page } };
}

async function onExecute(message, data) {
    const shopList = await Item.getAllItems();
    const pageCount = Math.ceil(shopList.length / LIST_PER_PAGE);

    const embed = await getShopEmbed(message, shopList, data.page);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("previous")
                           .setLabel("Previous Page")
                           .setStyle(1)
                           .setDisabled(false),

        new ButtonBuilder().setCustomId("next")
                           .setLabel("Next Page")
                           .setStyle(1)
                           .setDisabled(false)
    );

    const messageOptions = { embeds: [embed], components: [row] };

    const collector = message.channel.createMessageComponentCollector({
        filter: interaction => interaction.user.id === message.author.id,
        time: 60000
    });

    collector.on("collect", async interaction => {
        try {
            if (interaction.customId === "previous" && data.page > 1) {
                data.page--;
            } else if (interaction.customId === "next" && data.page < pageCount) {
                data.page++;
            }

            const updatedEmbed = await getShopEmbed(message, shopList, data.page);
            await interaction.update({ embeds: [updatedEmbed], components: [row] });
        } catch (error) {
            console.error("Error while processing button click:", error);
        }
    });

    return messageOptions;
}

async function getShopEmbed(message, shopList, page) {
  const idxStart = (page - 1) * LIST_PER_PAGE;
  const idxEnd = Math.min(idxStart + LIST_PER_PAGE, shopList.length);
  const itemsToShow = shopList.slice(idxStart, idxEnd);
  const title = "Blockman Forge (Velaire) Shop";
  const url = "https://discord.gg/bmf";
  const icon_url = iconConfig.shopIco;
  const description = "Buy an item with the `buy <item> [quantity]` command."

  let shopFormatted = [];
  itemsToShow.forEach((item, index) => {
    shopFormatted.push({
      name: `${idxStart + index + 1}. ${item.itemName}`,
      value: `${ecoConfig.symbol}${item.price} - ${item.desc}`,
      inline: false
    });
  });

  return {
    author: {
      name: title,
      icon_url: icon_url,
      url: url,
    },
    description: description,
    fields: shopFormatted,
    footer: {
      text: `Page ${page}/${Math.ceil(shopList.length / LIST_PER_PAGE)}`
    }
  };
}

async function onError(message, data) {
    return responses.error(message, `${ecoConfig.fail_symbol} ${data}`);
}

module.exports = {
    module: "economy",
    name: "shop",
    aliases: [],
    usage: "",
    description: "Shop command for economy",
    process: onProcess,
    execute: onExecute,
    error: onError
};
