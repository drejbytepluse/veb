const responses = require("@common/responses");
const ecoConfig = require("@config/economy");
const constants = require("@common/constants");
const redis = require("@common/redis");

async function onProcess(message, args) {
  const allowedRole = message.guild.roles.cache.find(role => role.name === "U-Admins");

  if (!allowedRole || !message.member.roles.cache.has(allowedRole.id)) {
      return { errorCode: constants.PROCESS_FAILED, data: "You don't have permission to use this command." };
  }

  if (args.length < 1) {
    return { errorCode: constants.PROCESS_FAILED, data: `Too few arguments given.\n\n` + "Usage:\n `vault [-info | -enable | -disable]`" };
  }

  return { errorCode: constants.PROCESS_SUCCESS, data: args };
}

async function onExecute(message, data) {
  const command = data[0];
  const statusValue = await redis.getKey(constants.VAULT_STATUS, "enable");

  switch (command) {
    case "-info":
      if (statusValue === "true") {
        return { embeds: [responses.success(message).setDescription(`${ecoConfig.toggle_on} Vault has been Enabled!`)]};
      } else {
        return { embeds: [responses.success(message).setDescription(`${ecoConfig.toggle_off} Vault has been Disabled!`)]}
      }
    case "-enable":
      if (statusValue === "true") {
        return responses.error(message, `${ecoConfig.fail_symbol} Vault is already Enabled!`);
      } else {
        await redis.setKey({ key: constants.VAULT_STATUS, params: ["enable"] }, "true");
        return { embeds: [responses.success(message).setDescription(`${ecoConfig.toggle_on} Vault has been Enabled by Admins!`)] };
      }
    case "-disable":
      if (statusValue === "false") {
        return responses.error(message, `${ecoConfig.fail_symbol} Vault is Already Disabled!`);
      } else {
        await redis.setKey({ key: constants.VAULT_STATUS, params: ["enable"] }, "false");
        return { embeds: [responses.success(message).setDescription(`${ecoConfig.toggle_off} Vault has been Disabled by Admins!`)] };
      }
    default:
      return { embeds: [responses.error(message, `${ecoConfig.fail_symbol} Invalid command.`)] };
  }
}

async function onError(message, data) {
  return responses.error(message, `${ecoConfig.fail_symbol} ${data}`);
}

module.exports = {
  module: "economy",
  name: "vault",
  aliases: ["v"],
  usage: "<info | enable | disable>",
  description: "Check vault status or enable/disable the vault",
  process: onProcess,
  execute: onExecute,
  error: onError
};
