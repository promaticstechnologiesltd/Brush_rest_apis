const passport = require("passport");
const { User, Admin } = require("../app/models/models");
const auth = require("../app/middleware/auth");
const JwtStrategy = require("passport-jwt").Strategy;

/**
 * Extracts token from: header, body or query
 * @param {Object} req - request object
 * @returns {string} token - decrypted token
 */
const jwtExtractor = (req) => {
  let token = null;
  if (req.headers.authorization) {
    token = req.headers.authorization.replace("Bearer ", "").trim();
  } else if (req.body.token) {
    token = req.body.token.trim();
  } else if (req.query.token) {
    token = req.query.token.trim();
  }
  if (token) {
    // Decrypts token
    token = auth.decrypt(token);
  }
  return token;
};

/**
 * Options object for jwt middlware
 */
const jwtOptions = {
  jwtFromRequest: jwtExtractor,
  secretOrKey: process.env.JWT_SECRET,
};

/**
 * Login with JWT middleware
 */
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  console.log("PAYLOAD TOKEN", payload);
  let collection = payload.data.role == "admin" ? Admin : User;
  collection
    .findOne({
      where: { id: payload.data.id, status: "active" },
    })
    .then((user) => {
      return !user ? done(null, false) : done(null, user);
    })
    .catch((err) => {
      return done(err, false);
    });
});

passport.use(jwtLogin);
