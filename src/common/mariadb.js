const logger = require("@common/logger");
const dbConfig = require("@config/database");
const mariadb = require("mariadb");

var pool = null;

function init() {
    pool = mariadb.createPool(dbConfig["mariadb"]);
}

async function executeQuery(query) {
    if (!pool) {
        throw Error("MariaDB is not initialized");
    }

    let conn;
    try {
        conn = await pool.getConnection();
        return await conn.query(query);
    } catch(err) {
        logger.error("An error occurred while using MariaDB");
        logger.error(err);
    } finally {
        if (conn) conn.end();
    }
}

async function findFirst(query, key, defaultValue = null) {
    const data = await executeQuery(query);
    if (data == null) {
        return defaultValue;
    }

    if (key == null) {
        return data[0] ?? defaultValue;
    }

    if (data.length > 0 && data[0][key]) {
        return data[0][key];
    }

    return defaultValue;
}

module.exports = {
    init: init,
    executeQuery: executeQuery,
    findFirst: findFirst
}