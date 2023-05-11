const {
  buildSuccObject,
  buildErrObject,
  itemNotFound,
} = require("../middleware/utils");

const { Op, condition } = require("sequelize");

/********************
 * CRUD functions *
 ********************/

module.exports = {
  /**
   * Gets item from database by id
   * @param {string} id - item id
   */
  async getItem(model, id, code = 404, error_msg = "ITEM NOT FOUND") {
    return new Promise((resolve, reject) => {
      model
        .findByPk(id)
        .then((data) =>
          data != "" && data != null
            ? resolve(data)
            : reject(buildErrObject(code, error_msg))
        )
        .catch((err) => reject(buildErrObject(422, err.message)));
    });
  },


  async getItemCustom(collection, condition, select = '', population = '') {
    return new Promise(async (resolve, reject) => {
      try {
        const item = await collection.findOne({where:condition});
        resolve({
          success: true,
          data: item
        });
      } catch (error) {
        reject(buildErrObject(422, error.message));
      }
    });
  },
  /**
   * Gets item from database by query
   * @param {string} query - item query
   */
  async getItemAccQuery(model, query) {
    return new Promise((resolve, reject) => {
      model
        .findOne({ where: query })
        .then((data) => resolve(data))
        .catch((err) => reject(buildErrObject(422, err.message)));
    });
  },
  /**
   * Get items from database
   * Always send limit offset after converting in number
   */
  async getItemsAccQuery(model, query, limit, offset, order = ["id", "ASC"]) {
    return new Promise((resolve, reject) => {
      model
        .findAll({
          where: query,
          order: [order],
          offset: offset,
          limit: limit,
        })
        .then((data) => resolve(data))
        .catch((err) => reject(buildErrObject(422, err.message)));
    });
  },
  /**
   * Get items from database
   * Always send limit offset after converting in number
   */
  async getItemsAccQueryWidCount(
    model,
    query,
    limit,
    offset,
    order = ["id", "ASC"]
  ) {
    return new Promise((resolve, reject) => {
      model
        .findAndCountAll({
          where: query,
          order: [order],
          offset: offset,
          limit: limit,
        })
        .then((data) => resolve(data))
        .catch((err) => reject(buildErrObject(422, err.message)));
    });
  },
  /**
   * Creates a new item in database
   * @param {Object} req - request object
   */
  async createItem(model, data) {
    return new Promise((resolve, reject) => {
      model
        .create(data)
        .then((data) => resolve(data))
        .catch((err) => reject(buildErrObject(422, err.message)));
    });
  },

  /**
   * Updates an item in database by condition
   * @param {Object} updtae - request object
   */
  async updateItem(model,condition,id) {
    return new Promise((resolve, reject) => {
      model
        .update(condition, { where: id })
        .then((data) =>
         { 
          data[0]
            ? resolve("UPDATED")
            : resolve(data.updated ? "UPDATED" : "NOTHING CHANGED")}
        )
        .catch((err, item) => itemNotFound(err, item, reject, "NOT_FOUND"));
    });
  },

  /**
   * Deletes items from database by query
   * @param {string} id - id of item
   */
  async deleteCustom(model, query) {
    return new Promise(async(resolve, reject) => {
     await model
        .destroy({ where: query })
        .then((data) => (data ? resolve("DELETED") : resolve("NOT FOUND")))
        .catch((err) => reject(buildErrObject(422, err.message)));
    });
  },

  /**
   * Get item with include from database
   */
  async getItemWithInclude(model, query, include) {
    return new Promise((resolve, reject) => {
      model
        .findOne({ where: query, include: include })
        .then((data) => resolve(data))
        .catch((err) => reject(buildErrObject(422, err.message)));
    });
  },

  /**
   * Get items with include from database
   */
  async getItemsWithInclude(
    model,
    query,
    include,
    limit,
    offset,
    order = ["id", "DESC"]
  ) {
    return new Promise((resolve, reject) => {
      model
        .findAndCountAll({
          where: query,
          include: include,
          order: [order],
          offset: offset,
          limit: limit,
          distinct: "id",
        })
        .then((data) => resolve(data))
        .catch((err) => reject(buildErrObject(422, err.message)));
    });
  },
};
