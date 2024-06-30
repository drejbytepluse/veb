const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const constants = require("@common/constants");
const logger = require("@common/logger");
const responses = require("@common/responses");
const ecoConfig = require("@config/economy");
const User = require("@models/User");
const CashTypes = require("@constants/CashTypes");

const LIST_PER_PAGE = 10;

async function onProcess(message, args) {
    let page = 1;
    let type = "total";

    if (args[0] && ["-cash", "-bank", "-total"].includes(args[0])) {
        type = args[0].slice(1);
        args.shift();
    } else if (args[0] && !isNaN(args[0])) {
        page = parseInt(args[0]);
    }

    const leaderboard = await User.getLeaderboard(type);

    return { errorCode: constants.PROCESS_SUCCESS, data: { type, page, leaderboard } };
}

async function onExecute(message, data) {
    const { type, page, leaderboard } = data;
    const pageCount = Math.ceil(leaderboard.length / LIST_PER_PAGE);

    const embed = await getLeaderboardEmbed(message, leaderboard, type, page);
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

    const collector = message.channel.createMessageComponentCollector({
        filter: (i => i.user.id === message.author.id),
        time: 60000
    });

    collector.on("collect", async (interaction) => {
        try {
            if (interaction.customId === "previous" && data.page > 1) {
                data.page--;
            } else if (interaction.customId === "next" && data.page < pageCount) {
                data.page++;
            }

            const updatedEmbed = await getLeaderboardEmbed(message, leaderboard, type, data.page);
            await interaction.update({ embeds: [updatedEmbed], components: [row] });
        } catch (error) {
            logger.error("Error while processing button click:", error);
        }
    });

    return { embeds: [embed], components: [row] };
}

async function onError(message, data) {
    return responses.error(message, `${ecoConfig.fail_symbol} You cannot access the leaderboard at the moment.`);
}

async function getLeaderboardEmbed(message, leaderboard, type, page) {
    const pageCount = Math.ceil(leaderboard.length / LIST_PER_PAGE);
    const idxStart = (page - 1) * LIST_PER_PAGE;
    const idxEnd = Math.min(idxStart + LIST_PER_PAGE, leaderboard.length);
    const title = getTitle(type);
    const userIndex = leaderboard.findIndex(entry => entry.userId === message.author.id);
    const userPosition = userIndex !== -1 ? userIndex + 1 : "N/A";
    let leaderboardFormatted = "";

    leaderboard.slice(idxStart, idxEnd).forEach((entry, index) => {
        const cashShown = getCashShown(entry, type);
        leaderboardFormatted += `\n**${idxStart + index + 1}.** <@${entry.userId}> • ${ecoConfig.symbol}${cashShown}`;
    });

    return {
        author: {
            name: title,
            icon_url: "https://media.discordapp.net/attachments/1253585384005304353/1255004452239446036/Untitled_design_3.png?ex=668224fa&is=6680d37a&hm=f2359a38ff79ffd7f2911051bedff8f4c0ae220063022c36ab4693f6652e6b1f&=&format=webp&quality=lossless&width=350&height=350",
            url: "https://discord.gg/bmf",
        },
        description: leaderboardFormatted,
        footer: {
            text: `Your leaderboard rank: ${userPosition}  •  Page ${page}/${pageCount}`
        }
    };
}

function getTitle(type) {
    switch (type) {
        case CashTypes.CASH:
            return "Blockman Forge (Velaire) Cash Leaderboard";
        case CashTypes.BANK:
            return "Blockman Forge (Velaire) Bank Leaderboard";
        default:
            return "Blockman Forge (Velaire) Leaderboard";
    }
}

function getCashShown(entry, type) {
    return type === CashTypes.CASH ? entry.cash : type === CashTypes.BANK ? entry.bank : entry.cash + entry.bank;
}

module.exports = {
    module: "economy",
    name: "leaderboard",
    aliases: ["lb"],
    usage: "",
    description: "Shows the server leaderboard",
    process: onProcess,
    execute: onExecute,
    error: onError,
};
