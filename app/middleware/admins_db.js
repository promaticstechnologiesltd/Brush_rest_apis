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

const { randomString, uploadFile } = require("../shared/helpers");
const STORAGE_PATH = process.env.STORAGE_PATH;
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

  async uploadImg(imgs, path) {
    return new Promise(async (resolve, reject) => {
      try {
        let multipleImgs = [];
        let singleImg
        if (imgs && Array.isArray(imgs.images)) {
          for await (const imgData of imgs.images) {
            const image = await uploadFile({
              file: imgData,
              path: `${STORAGE_PATH}/${path}`,
            });
            multipleImgs.push(`https://production.promaticstechnologies.com/brush_rest_apis/public/${path}/${image}`);
            resolve(multipleImgs)
          }
        } else if (imgs && !Array.isArray(imgs.images)) {
          var image = await uploadFile({
            file: imgs.images,
            path: `${STORAGE_PATH}/${path}`,
          });
          singleImg = `https://production.promaticstechnologies.com/brush_rest_apis/public/${path}/${image}`
          resolve(singleImg)
        }
      } catch (error) {
        reject(buildErrObject(422, error.message));
      }
    });
  },

  async icons(model, data) {
    return new Promise(async (resolve, reject) => {
      let response;
      try {
        if (data.id && data.type == "update") {
          response = await updateItem(model, data, { id: data.id })
          resolve(response);
        } else if (data.id && data.type == "delete") {
          response = await deleteCustom(model, { id: data.id })
          resolve(response);
        } else {
          response = await createItem(model, data);
          resolve(response);
        }
      } catch (error) {
        reject(buildErrObject(422, error.message));
      }
    });
  },
};
