const crypto = require('crypto')
const secret = process.env.JWT_SECRET
const algorithm = 'aes-256-cbc'
// Key length is dependent on the algorithm. In this case for aes256, it is
// 32 bytes (256 bits).
const key = crypto.scryptSync(secret, 'salt', 32)
const iv = Buffer.alloc(16, 0) // Initialization crypto vector
var bcrypt = require('bcrypt');
const {
  buildSuccObject,
  buildErrObject,
  itemNotFound,
} = require("../middleware/utils");

module.exports = {
  /**
   * Checks is password matches
   * @param {string} password - password
   * @param {Object} user - user object
   * @returns {boolean}
   */
  async checkPassword(password, userPassword) {
    return new Promise((resolve, reject) => {
      if (bcrypt.compareSync(password, userPassword)) { //if matched successfully
        resolve(true)
      } else {
        resolve(false)
      }
    })
  },

  /**
   * Encrypts text
   * @param {string} text - text to encrypt
  */
  encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  },

  /**
   * Decrypts text
   * @param {string} text - text to decrypt
  */
  decrypt(text) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    try {
      let decrypted = decipher.update(text, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } catch (err) {
      return err
    }
  },

  async changeOldPassword(body, model) {
    return new Promise((resolve, reject) => {
      console.log("==body", body);
      model
        .findOne({
          where:{id: body.id},
        })
        .then(async (updatePassword) => {
          if(updatePassword) {
            const isOldPasswordMatch = await this.checkPassword(body.old_password, updatePassword.password)
            if (!isOldPasswordMatch) {
              reject(buildErrObject(422, "Wrong Current Password!"));
            }const isNewPasswordMatch = await this.checkPassword(body.new_password, updatePassword.password)
            if (isNewPasswordMatch) {
              reject(buildErrObject(422, "New password is not same with old password"));
            } else {
              updatePassword.password = body.new_password;
              updatePassword
                .save()
                .then((saved) => {
                  resolve({
                    code: 200,
                    msg: "Password changed successfully",
                  });
                })
                .catch((err) => {
                  reject(buildErrObject(422, err.message));
                });
            }
          }else {
            reject(buildErrObject(422, "Item Not Found"));
          }
        })
        .catch((err) => {
          reject(buildErrObject(422, err.message));
        });
    });
  },

}
