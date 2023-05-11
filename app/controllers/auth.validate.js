const { validationResult } = require("../middleware/utils");
const { check } = require("express-validator");

/**
 * Validates register request
 */
exports.register = [
  check("full_name")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY"),
  check("phone_number")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY"),
  check("email")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isEmail()
    .withMessage("EMAIL_IS_NOT_VALID"),
  check("role")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isIn(["customer", "painter"])
    .withMessage("Please select an appropriate role"),
  check("password")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isLength({
      min: 5,
    })
    .withMessage("PASSWORD_TOO_SHORT_MIN_5"),
  (req, res, next) => {
    console.log(req.body);
    validationResult(req, res, next);
  },
];

/**
 * Validates login request
 */
exports.login = [
  check("password")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isLength({
      min: 5,
    })
    .withMessage("PASSWORD_TOO_SHORT_MIN_5"),
  (req, res, next) => {
    validationResult(req, res, next);
  },
];

exports.adminLogin = [
  check("email")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isEmail()
    .withMessage("EMAIL_IS_NOT_VALID"),
  check("password")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isLength({
      min: 5,
    })
    .withMessage("PASSWORD_TOO_SHORT_MIN_5"),
  (req, res, next) => {
    validationResult(req, res, next);
  },
];
/**
 * Validates verify request
 */
exports.verify = [
  check("id")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY"),
  (req, res, next) => {
    validationResult(req, res, next);
  },
];

/**
 * Validates forgot password request
 */
exports.forgotPassword = [
  check("email")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isEmail()
    .withMessage("EMAIL_IS_NOT_VALID"),
  (req, res, next) => {
    validationResult(req, res, next);
  },
];

/**
 * Validates reset password request
 */
exports.resetPassword = [
  check("id")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY"),
  check("password")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isLength({
      min: 5,
    })
    .withMessage("PASSWORD_TOO_SHORT_MIN_5"),
  (req, res, next) => {
    validationResult(req, res, next);
  },
];

/**
 * Validates username availability request
 */
exports.checkUsernameAvailability = [
  check("username")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY"),
  (req, res, next) => {
    validationResult(req, res, next);
  },
];

/**
 * Validates email availability request
 */
exports.checkEmailAvailability = [
  check("email")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY"),
  (req, res, next) => {
    validationResult(req, res, next);
  },
];

/**
 * Validates email availability request
 */
exports.socialRegisterAndLogin = [
  check("social_id")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY"),
  check("email")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isEmail()
    .withMessage("EMAIL_IS_NOT_VALID"),
  check("role")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isIn(["customer", "painter"])
    .withMessage("Please select an appropriate role"),
  check("social_type")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isIn(["google", "facebook"])
    .withMessage("Please select an appropriate type"),
  (req, res, next) => {
    validationResult(req, res, next);
  },
];
