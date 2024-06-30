const { dirname } = require("path");

module.exports = {
  ROOT_DIRECTORY: `${dirname(require.main.filename)}`,

  AMOUNT_ALL: "ALL",

  CACHE_COOLDOWN: "cache.%s.%s",
  CACHE_CHATCOOLDOWN: "cache.%s.%s",
  VAULT_STATUS: "status.vault.%s",
  TRANSFER_CD: "cache.transfer.%s",

  INNER_API: "http://0.0.0.0:9988",
  BASE_API: "https://mods.velaire.tech",

  MAIL_ENDPOINT: "/mail/api/v1/send",
  BIND_ENDPOINT: "/discord/api/v1/bind/status",
  INFO_ENDPOINT: "/user/api/v1/user/info",

  PROCESS_SUCCESS: 0,
  PROCESS_FAILED: 1,
};
