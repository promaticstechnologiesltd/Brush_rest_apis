const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const i18n = require("i18n");
const Models = require("../models/models");
const { itemAlreadyExists, itemExists } = require("../middleware/utils");
const express = require("express");
var jwt = require("jsonwebtoken");
var path = require("path");
const app = express();
const APP_NAME = process.env.APP_NAME;
const { capitalizeFirstLetter } = require("../shared/helpers");
app.set("views", path.join(`${process.env.SERVER_PATH}`, "views"));
// app.set('view engine', 'jade');
app.set("view engine", "ejs"); // we use ejs
var mailer = require("express-mailer");

mailer.extend(app, {
  from: `${process.env.EMAIL_FROM_APP} <no-reply@brush.com>`,
  host: process.env.EMAIL_HOST, // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: process.env.EMAIL_TRANSPORT_METHOD, // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD, //protjmsingh//maha@321
  },
});
module.exports = {
  /**
   * Checks User model if user with an specific username exists
   * @param {string} username - user username
   * @param {Boolean} throwError - whenther to throw error or not
   */

  async usernameExists(username, throwError = false) {
    return new Promise((resolve, reject) => {
      User.findOne({
        username: username,
      })
        .then((item) => {
          var err = null;
          if (throwError) {
            itemAlreadyExists(err, item, reject, "USERNAME ALREADY EXISTS");
          }
          resolve(item ? true : false);
        })
        .catch((err) => {
          var item = null;
          itemAlreadyExists(err, item, reject, "ERROR");
          resolve(false);
        });
    });
  },

  async emailExistsForSocialRegister(email, column) {
    return new Promise((resolve, reject) => {
      Models.User.findOne({
        where: {
          email: email,
          [column]: {
            [Op.is]: null,
          },
        },
      })
        .then((item) => {
          var err = null;
          itemAlreadyExists(err, item, reject, "EMAIL_ALREADY_EXISTS");
          resolve(false);
        })
        .catch((err) => {
          var item = null;
          itemAlreadyExists(err, item, reject, "ERROR");
          resolve(false);
        });
    });
  },

  async emailExistsForLogin(email) {
    return new Promise((resolve, reject) => {
      model.User.findOne({
        where: {
          email: email,
        },
      })
        .then((item) => {
          var err = null;
          itemExists(err, item, reject, "EMAIL DOES NOT EXISTS");
          resolve(false);
        })
        .catch((err) => {
          var item = null;
          itemExists(err, item, reject, "ERROR");
          resolve(false);
        });
    });
  },

  async emailExistsAdmin(email, id) {
    return new Promise((resolve, reject) => {
      console.log(email, id);
      model.Admin.findOne({
        where: {
          id: {
            [Op.not]: id,
          },
          email: email,
        },
      })
        .then((item) => {
          if (item) {
            resolve(false);
          } else {
            resolve(true);
          }
        })
        .catch((err) => {
          var item = null;
          itemAlreadyExists(err, item, reject, "ERROR");
          resolve(false);
        });
    });
  },

  async mobileExistsAdmin(phone_no, id) {
    return new Promise((resolve, reject) => {
      model.Admin.findOne({
        where: {
          id: {
            [Op.not]: id,
          },
          phone_no: phone_no,
        },
      })
        .then((item) => {
          if (item) {
            resolve(false);
          } else {
            resolve(true);
          }
        })
        .catch((err) => {
          var item = null;
          itemAlreadyExists(err, item, reject, "ERROR");
          resolve(false);
        });
    });
  },

  /**
   * Checks User model if user with an specific email exists but excluding user id
   * @param {string} id - user id
   * @param {string} email - user email
   */
  async emailExistsExcludingMyself(id, email) {
    return new Promise((resolve, reject) => {
      User.findOne(
        {
          email,
          _id: {
            $ne: id,
          },
        },
        (err, item) => {
          itemAlreadyExists(err, item, reject, "EMAIL_ALREADY_EXISTS");
          resolve(false);
        }
      );
    });
  },

  /**
   * Checks User model if user with an specific mobile exists but excluding user id
   * @param {string} id - user id
   * @param {string} email - user email
   */
  async checkMobileExistsExcludingMyself(id, phone_no) {
    return new Promise((resolve, reject) => {
      model.User.findOne({
        where: {
          phone_no: phone_no,
          id: {
            [Op.not]: id,
          },
        },
      }).then((item) => {
        if (item) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  },

  /**
   * Sends email common
   * @param {string} locale - locale
   * @param {Object} mailOptions - mailOptions object
   * @param {string} template - template
   */

  async sendEmail(locale, mailOptions, template) {
    mailOptions.website_url = process.env.WEBSITE_URL;
    app.mailer.send(
      `${locale}/${template}`,
      mailOptions,
      function (err, message) {
        if (err) {
          console.log("There was an error sending the email" + err);
        } else {
          console.log("Mail sent");
        }
      }
    );
  },

  // in use functions
  /**
   * Checks User model if user with an specific email exists
   * @param {string} email - user email
   * @param {Boolean} throwError - whenther to throw error or not
   */
  async emailExists(email, throwError = true) {
    return new Promise((resolve, reject) => {
      Models.User.findOne({
        where: { email: email },
      })
        .then((item) => {
          var err = null;
          if (throwError) {
            itemAlreadyExists(err, item, reject, "EMAIL ALREADY EXISTS");
          }
          resolve(item ? true : false);
        })
        .catch((err) => {
          var item = null;
          itemAlreadyExists(err, item, reject, "ERROR");
          resolve(false);
        });
    });
  },

  async userExists(email, throwError = true) {
    return new Promise((resolve, reject) => {
      Models.User.findOne({
        where: {
          email: email,
        },
      })
        .then((item) => {
          var err = null;
          if (throwError) {
            itemAlreadyExists(err, item, reject, "EMAIL ALREADY EXISTS");
          }
          resolve(item ? item : false);
        })
        .catch((err) => {
          var item = null;
          itemAlreadyExists(err, item, reject, "ERROR");
          resolve(false);
        });
    });
  },
  async socialIdExists(social_id, social_type, throwError = false) {
    return new Promise((resolve, reject) => {
      Models.User.findOne({
        where: {
          social_id: social_id,
          social_type: social_type,
        },
      })
        .then((item) => {
          var err = null;
          if (throwError) {
            itemAlreadyExists(err, item, reject, "USER ALREADY EXISTS");
          }
          resolve(item ? true : false);
        })
        .catch((err) => {
          var item = null;
          itemAlreadyExists(err, item, reject, "ERROR");
          resolve(false);
        });
    });
  },
  async mobileExists(phone_no) {
    return new Promise((resolve, reject) => {
      Models.User.findOne({
        where: {
          phone_no: phone_no,
        },
      })
        .then((item) => {
          var err = null;
          itemAlreadyExists(err, item, reject, "MOBILE NUMBER_ALREADY_EXISTS");
          resolve(item ? true : false);
        })
        .catch((err) => {
          var item = null;
          itemAlreadyExists(err, item, reject, "ERROR");
          resolve(false);
        });
    });
  },
  async sendOtpOnEmail(locale, data, subject) {
    var mailOptions = {
      to: data.email,
      subject,
      name: data.name,
      otp: data.otp,
    };

    console.log("mailOptions",mailOptions);
    app.mailer.send(`${locale}/sendOTP`, mailOptions, function (err, message) {
      if (err) {
        console.error("There was an error sending the email" + err);
      } else {
        console.log("Mail sent to user");
      }
    });
  },

  async forgetEmailLink(locale, data, subject) {
    var mailOptions = {
      to: data.email,
      subject,
      name: data.name,
    };

    console.log("mailOptions",mailOptions);
    app.mailer.send(`${locale}/forgetEmailLink`, mailOptions, function (err, message) {
      if (err) {
        console.error("There was an error sending the email" + err);
      } else {
        console.log("Mail sent to user");
      }
    });
  },
  async passwordSent(locale, data) {
    var mailOptions = {
      to: data.email,
      subject: "Password",
      password: data.decoded_pasword,
      name:data.full_name
    };
    app.mailer.send(
      `${locale}/passwordSent`,
      mailOptions,
      function (err, message) {
        if (err) {
          console.log("There was an error sending the email" + err);
        } else {
          console.log("Mail sent to user");
        }
      }
    );
  }
};
