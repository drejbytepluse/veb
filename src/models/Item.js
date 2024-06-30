const mariadb = require("@common/mariadb");
const Model = require("@models/Model");

module.exports = class Item extends Model {
  constructor(itemId, itemName, desc, price) {
    super();
    this.itemId = itemId;
    this.itemName = itemName;
    this.desc = desc;
    this.price = price;
  }

  /** @returns {Promise<Array<Item>>} */
  static async getAllItems() {
    const items = await mariadb.executeQuery(`SELECT itemId, itemName, \`desc\`, price FROM item`);
    return items.map(item => Model.fromJson(Item, item));
  }

  /** @returns {Promise<Item>} */
  static async getItemByName(itemName) {
    const item = await mariadb.findFirst(`SELECT * FROM item WHERE itemName="${itemName}"`);
    if (item) return Model.fromJson(Item, item);

    return null;
  }

  /** @returns {Promise<Object>} */
  static async getInventory(userId) {
    let userInventory = {};
    const inventoryData = await mariadb.findFirst(`SELECT items FROM user_data WHERE userId=${userId}`);
    if (inventoryData && inventoryData.items) {
        try {
            return inventoryData.items;
        } catch (error) {
            console.error("Error accessing inventory data:", error);
        }
    }

    return userInventory;
  }
}
