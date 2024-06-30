const crypto = require("crypto");
const authConfig = require("@config/auth");

async function createAuthParams() {
    const timestamp = Date.now();

    const nonce = crypto.randomBytes(16)
                        .toString("hex");

    const signature = crypto.createHash("sha1")
                            .update(`${authConfig.innerSecretKey}${nonce}${timestamp}`)
                            .digest("hex");

    return { timestamp, nonce, signature };
}

module.exports = {
    createAuthParams : createAuthParams
}