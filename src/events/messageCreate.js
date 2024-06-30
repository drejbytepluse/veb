const cmConfig = require("@config/chatmoney");

async function handleMessageCreate(message) {
  if (cmConfig.includes(message.channel.id)) {
    console.log(`Message created in allowed channel: ${message.content}`);
  }
}

module.exports = {
  messageCreateEvent: handleMessageCreate
}