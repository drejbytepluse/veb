const mariadb = require("@common/mariadb");
const Model = require("@models/Model");

module.exports = class User extends Model {
    constructor(userId) {
        super();

        this.userId = userId;
        this.cash = 0;
        this.bank = 0;
        this.items = {};
    }

    /** @returns {Promise<User>} */
    static async fromUserId(userId) {
        const user = await mariadb.findFirst(`SELECT * FROM user_data WHERE userId=${userId}`);
        if (user) return Model.fromJson(User, user);

        return new User(userId);
    }

    /** @returns {Promise<Boolean>} */
    static async exists(userId) {
        const rows = await mariadb.executeQuery(`SELECT COUNT(1) FROM user_data WHERE userId=${userId}`);
        return rows[0]["COUNT(1)"] == 1;
    }

    static async getAllUsers() {
        const users = await mariadb.executeQuery(`SELECT * FROM user_data`);
        return users.map(user => Model.fromJson(User, user));
    }

    static async getLeaderboard(type = 'total') {
        let orderByField;
        switch (type.toLowerCase()) {
            case 'cash':
                orderByField = 'cash';
                break;
            case 'bank':
                orderByField = 'bank';
                break;
            default:
                orderByField = '(cash + bank)';
        }

        const leaderboard = await mariadb.executeQuery(`SELECT userId, (cash + bank) AS total, cash, bank FROM user_data ORDER BY ${orderByField} DESC`);
        return leaderboard.map(user => Model.fromJson(User, user));
    }

    addCash(cash) {
        this.cash += cash;
    }

    removeCash(cash) {
        this.cash -= cash;
    }

    addBankCash(cash) {
        this.bank += cash;
    }

    removeBankCash(cash) {
        this.bank -= cash;
    }

    async save() {
        this.cash = parseFloat(this.cash);
        const sqlQuery = `INSERT INTO user_data VALUES ${super.getSqlCreate()} ON DUPLICATE KEY UPDATE ${super.getSqlUpdate()}`;

        await mariadb.executeQuery(sqlQuery);
    }

    response() {
        return {
            userId: this.userId,
            cash: this.cash,
            bank: this.bank,
            items: this.items
        }
    }

    setUserId(userId) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
    }

    setCash(cash) {
        this.cash = cash;
    }

    getCash() {
        return this.cash;
    }

    setBank(bank) {
        this.bank = bank;
    }

    getBank() {
        return this.bank;
    }

    setItems(items) {
        this.items = items;
    }

    getItems() {
        return this.items;
    }

    /**
     * @param {Item} item
     * @param {number} quantity
     */
    addItem(item, quantity) {
        const { itemName } = item;
        if (this.items[itemName]) {
            this.items[itemName].quantity += parseInt(quantity);
        } else {
            this.items[itemName] = {
                quantity: parseInt(quantity),
            };
        }
    }
    /**
     * @param {string} itemName
     * @param {number} quantity
     */
    removeItem(itemName, quantity) {
        if (!this.items[itemName]) {
            return;
        }
    const remainingQuantity = this.items[itemName].quantity - parseInt(quantity);
        if (remainingQuantity <= 0) {
            delete this.items[itemName]; // Remove item if quantity becomes zero or negative
        } else {
            this.items[itemName].quantity = remainingQuantity;
        }
    }
}
