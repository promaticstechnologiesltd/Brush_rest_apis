const { handleError, buildErrObject } = require("../middleware/utils");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

module.exports = {
  /**
   * upload file to server
   * @param {Object} object - binary file with path
   */

  async uploadFile(object) {
    return new Promise((resolve, reject) => {
      var obj = object.file;
      console.log("obj", obj);
      var name = Date.now() + obj.name;
      obj.mv(object.path + "/" + name, function (err) {
        if (err) {
          reject(buildErrObject(422, err.message));
        }
        resolve(name);
      });
    });
  },
  /********************
   * Private functions *
   ********************/
  async getUserIdFromToken(token) {
    // in case need to get id without requireAuth
    return new Promise((resolve, reject) => {
      const tokenEncrypted = token.replace("Bearer ", "").trim();

      // Decrypts, verifies and decode token
      jwt.verify(
        auth.decrypt(tokenEncrypted),
        process.env.JWT_SECRET,
        (err, decoded) => {
          if (err) {
            reject(buildErrObject(401, "Unauthorized"));
          }
          resolve(decoded.data.id);
        }
      );
    });
  },

  /**
   * capitalize first letter of string
   * @param {string} string
   */

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  /**
   * generate random string
   * @param {string} string
   */

  async randomString(length, chars) {
    var result = "";
    for (var i = length; i > 0; --i)
      result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  },

  /**
   * convert a given array of string to mongoose ids
   * @param {Array} array
   */
};
