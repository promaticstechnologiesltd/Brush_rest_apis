require("dotenv-safe").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors");
const passport = require("passport");
const app = express();
const i18n = require("i18n");
const path = require("path");
var fileUpload = require("express-fileupload");
const initMySQL = require("./config/mysql");
var https = require("https");

var fs = require("fs");

var options = {
  key: fs.readFileSync(
    "/etc/letsencrypt/live/production.promaticstechnologies.com/privkey.pem",
    "utf8"
  ),
  cert: fs.readFileSync(
    "/etc/letsencrypt/live/production.promaticstechnologies.com/fullchain.pem",
    "utf8"
  ),
};

// Setup express server port from ENV, default: 3000
app.set("port", process.env.PORT || 3000);

// Enable only in development HTTP request logger middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Redis cache enabled by env variable
if (process.env.USE_REDIS === "true") {
  const getExpeditiousCache = require("express-expeditious");
  const cache = getExpeditiousCache({
    namespace: "expresscache",
    defaultTtl: "1 minute",
    engine: require("expeditious-engine-redis")({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
  });
  app.use(cache);
}

// for parsing json
app.use(
  bodyParser.json({
    limit: "20mb",
  })
);
// for parsing application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: "20mb",
    extended: true,
  })
);

// i18n
i18n.configure({
  locales: ["en", "es"],
  directory: `${__dirname}/locales`,
  defaultLocale: "en",
  objectNotation: true,
});
app.use(i18n.init);

// Init all other stuff

// place this middleware before declaring any routes
app.use((req, res, next) => {
  // This reads the accept-language header
  // and returns the language if found or false if not
  const lang = req.acceptsLanguages("en", "ar");
  if (lang) {
    // if found, attach it as property to the request
    req.lang = lang;
  } else {
    // else set the default language
    req.lang = "en";
  }
  next();
});
app.use(cors());
app.use(passport.initialize());
app.use(compression());
app.use(helmet());
app.use(fileUpload());
// app.use(express.static('public'))
// app.set('views', path.join(__dirname, 'views'))
app.engine("ejs", require("ejs").renderFile);
// app.set('view engine', 'html')
app.set("view engine", "ejs");
app.use(require("./app/routes/index"));
//app.listen(app.get('port'))
console.log(app.get("port"));
var httpsServer = https.createServer(options, app);
httpsServer.listen(app.get("port"), function () {
  console.log("socket running on port no : " + app.get("port"));
});

module.exports = app; // for testing
