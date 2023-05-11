const {
  buildErrObject,
  handleError,
  buildSuccObject,
  itemNotFound,
  itemAlreadyExists,
  itemExists,
} = require("../middleware/utils");

const {
  getItem,
  getItemAccQuery,
  createItem,
  updateItem,
  deleteCustom,
  getItems,
  getItemWithInclude,
  getItemsWithInclude,
} = require("../shared/core");

const { randomString } = require("../shared/helpers");
const uuid = require("uuid");

module.exports = {
  async test(collection, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const item = await getItemCustom(
          collection,
          { type: data.type },
          "content title updatedAt"
        );
        resolve(item);
      } catch (error) {
        reject(buildErrObject(422, error.message));
      }
    });
  },
  async createChatRoom(model, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const record = await model
          .findOne({
            where: {
              [Op.or]: [
                {
                  [Op.and]: [
                    {
                      sender_id: data.receiver_id,
                    },
                    {
                      receiver_id: data.sender_id,
                    },
                  ]
                },
                {
                  [Op.and]: [
                    {
                      receiver_id: data.receiver_id,
                    },
                    {
                      sender_id: data.sender_id,
                    },
                  ],
                },
              ]
            }
          })
        if (record) {
          resolve(record);
        } else {
          data.room_id = uuid.v4();
          const create = await model.create(data);
          resolve({ code: 200, result: create, status: 'room created..' });
        }
      } catch (err) {
        console.log(err);
        reject(buildErrObject(422, err.message));
      }
    });
  },
};
