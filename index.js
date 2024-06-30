require("module-alias")();
const handler = require("@common/handler");
const discordConfig = require("@config/discord");
const mariadb = require("@common/mariadb");
const redis = require("@common/redis");
const { Client, GatewayIntentBits } = require("discord.js");
const logger = require("@common/logger");

handler.init();
mariadb.init();
redis.init();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on("ready", () => {
    logger.info(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
        status: "online"
    })
});

client.on("messageCreate", async (message) => {
    try {
        if (!message.content.startsWith(discordConfig.prefix)) {
            return;
        }

        if (discordConfig.ownersOnly && !discordConfig.owners.includes(message.author.id)) {
            return;
        }

        const result = await handler.execute(message);
        if (result == null) {
            return;
        }

        await message.channel.send(result);
    } catch (error) {
        console.log(error);
    }
});

client.login(discordConfig.token);