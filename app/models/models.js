var Sequelize = require("sequelize");
var bcrypt = require("bcrypt");
const saltRounds = 10;
const { values } = require("lodash");
exports.User = sequelize.define("users", {
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: {
        msg: "Email Not Valid!",
      },
    },
  },
  social_id: {
    type: Sequelize.STRING,
  },
  social_type: {
    type: Sequelize.ENUM,
    values: ["google", "facebook"],
  },
  last_sign_in: {
    type: Sequelize.DATE,
  },
  profile_image: {
    type: Sequelize.STRING,
  },

  phone_number: {
    type: Sequelize.STRING,
  },
  full_name: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
    set(value) {
      // Storing passwords in plaintext in the database is terrible.
      // Hashing the value with an appropriate cryptographic hash function is better.
      this.setDataValue("password", bcrypt.hashSync(value, saltRounds));
    },
  },
  decoded_pasword: {
    type: Sequelize.STRING,
  },
  sign_up_date: {
    type: Sequelize.DATE,
  },

  full_address: {
    type: Sequelize.STRING,
  },
  city: {
    type: Sequelize.STRING,
  },
  state: {
    type: Sequelize.STRING,
  },
  zip_code: {
    type: Sequelize.STRING,
  },
  latitude: {
    type: Sequelize.DOUBLE,
  },
  longitude: {
    type: Sequelize.DOUBLE,
  },
  status: {
    type: Sequelize.ENUM,
    values: ["active", "inactive"],
  },
  role: {
    type: Sequelize.ENUM,
    values: ["customer", "painter"],
  },
  blockExpires: {
    type: Sequelize.DATE,
  },
  loginAttempts: {
    type: Sequelize.INTEGER,
  },
  verified: {
    // default is 0
    type: Sequelize.TINYINT,
  },
  verification: {
    type: Sequelize.STRING,
  },
  stay_logged_in: {
    type: Sequelize.ENUM,
    values: ["true", "false"],
  },
  send_email: {
    type: Sequelize.ENUM,
    values: ["true", "false"],
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.Admin = sequelize.define("admins", {
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: {
        msg: "Email Not Valid!",
      },
    },
  },
  profile_image: {
    type: Sequelize.STRING,
  },
  full_address: {
    type: Sequelize.STRING,
  },
  // phone_number: {
  //   type: Sequelize.STRING,
  // },
  full_name: {
    type: Sequelize.STRING,
  },
  phone_number: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
    set(value) {
      // Storing passwords in plaintext in the database is terrible.
      // Hashing the value with an appropriate cryptographic hash function is better.
      this.setDataValue("password", bcrypt.hashSync(value, saltRounds));
    },
  },
  forgot_password_otp: {
    // default is null
    type: Sequelize.INTEGER,
  },
  forgot_password_otp_time: {
    // default is null
    type: Sequelize.DATE,
  },
  blockExpires: {
    type: Sequelize.DATE,
  },
  loginAttempts: {
    type: Sequelize.INTEGER,
  },
  verified: {
    // default is 0
    type: Sequelize.TINYINT,
  },
  verification: {
    type: Sequelize.STRING,
  },
  // is_phone_verified:{
  //   type: Sequelize.TINYINT,
  // },
  // is_email_verified:{
  //   type: Sequelize.TINYINT,
  // },
  // is_password_verified:{
  //   type: Sequelize.TINYINT,
  // },
  last_sign_in: {
    type: Sequelize.DATE,
  },
  sign_up_date: {
    type: Sequelize.DATE,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.AdminforgotPassword = sequelize.define("ForgotPassword", {
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: {
        msg: "Email Not Valid!",
      },
    },
  },
  verification: {
    type: Sequelize.STRING,
  },
  type: {
    type: Sequelize.ENUM,
    values: ["admin", "user"],
  },
  // phone_number: {
  //   type: Sequelize.STRING,
  // },
  ipRequest: {
    type: Sequelize.STRING,
  },
  browserRequest: {
    type: Sequelize.STRING,
  },
  countryRequest: {
    type: Sequelize.STRING,
  },
  ipChanged: {
    type: Sequelize.STRING,
  },
  browserChanged: {
    type: Sequelize.STRING,
  },
  countryChanged: {
    type: Sequelize.STRING,
  },
  // is_phone_verified:{
  //   type: Sequelize.TINYINT,
  // },
  // is_email_verified:{
  //   type: Sequelize.TINYINT,
  // },
  // is_password_verified:{
  //   type: Sequelize.TINYINT,
  // },
  // last_sign_in: {
  //   type: Sequelize.DATE,
  // },
  // sign_up_date: {
  //   type: Sequelize.DATE,
  // },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.UserAccess = sequelize.define("user_accesses", {
  email: {
    type: Sequelize.STRING,
  },
  role: {
    type: Sequelize.STRING,
  },
  ip: {
    type: Sequelize.STRING,
  },
  browser: {
    type: Sequelize.STRING,
  },
  country: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.Category = sequelize.define("categories", {
  name: {
    type: Sequelize.STRING,
  },
  type: {
    type: Sequelize.ENUM,
    values: [
      "room_types",
      "provided_item_for_work",
      "property_type",
      "scheduling_preferences",
      "paint_surface_type",
      "painting_type",
      "extra_work_type",
    ],
  },
  image: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.creditvalues = sequelize.define("creditvalues", {
  project_id: {
    type: Sequelize.STRING,
  },
  value: {
    type: Sequelize.STRING,
  },
  user_id: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
});

exports.modifycreditvalue = sequelize.define("modifycreditvalues", {
  value: {
    type: Sequelize.STRING,
  },
  user_id: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
});

exports.chat_message = sequelize.define("chat_message", {
  message_id: {
    type: Sequelize.STRING,
  },
  content: {
    type: Sequelize.STRING,
  },
  receiver: {
    type: Sequelize.STRING,
  },
  receiver_client_id: {
    type: Sequelize.STRING,
  },
  receiver_full_name: {
    type: Sequelize.STRING,
  },
  sender: {
    type: Sequelize.STRING,
  },
  sender_client_id: {
    type: Sequelize.STRING,
  },
  sender_full_name: {
    type: Sequelize.STRING,
  },
  chat_conversation_id: {
    type: Sequelize.STRING,
  },
  sender_profile_image: {
    type: Sequelize.STRING,
  },
  file: {
    type: Sequelize.STRING,
  },
  file_name: {
    type: Sequelize.STRING,
  },
  message_type: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
});

exports.Project = sequelize.define("projects", {
  customer_id: {
    type: Sequelize.INTEGER,
  },
  projectCreatorType: {
    type: Sequelize.STRING,
  },
  projectType: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.ENUM,
    values: ["pending", "approved", "rejected"],
  },
  bid_status: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.SocialLinks = sequelize.define("sociallinks", {
  Iconclass: {
    type: Sequelize.STRING,
  },
  Url: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
});

exports.ProjectDetails = sequelize.define("project_detail", {
  project_id: {
    type: Sequelize.INTEGER,
  },

  description: {
    type: Sequelize.STRING,
  },
  title: {
    type: Sequelize.STRING,
  },
  startDate: {
    type: Sequelize.DATE,
  },
  dueDate: {
    type: Sequelize.DATE,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.ProjectTags = sequelize.define("project_tag", {
  project_id: {
    type: Sequelize.INTEGER,
  },
  localType: {
    type: Sequelize.STRING,
  },
  roomsNumber: {
    type: Sequelize.STRING,
  },
  roomBathroom: {
    type: Sequelize.STRING,
  },
  paintingDoors: {
    type: Sequelize.STRING,
  },
  surfaceArea: {
    type: Sequelize.STRING,
  },
  ceilingHeight: {
    type: Sequelize.STRING,
  },
  fauxFinish: {
    type: Sequelize.STRING,
  },
  hasWallpaper: {
    type: Sequelize.STRING,
  },
  surfaceCondition: {
    type: Sequelize.STRING,
  },
  providingItems: {
    type: Sequelize.STRING,
  },
  propertyType: {
    type: Sequelize.STRING,
  },
  schedulingPreferences: {
    type: Sequelize.STRING,
  },
  cleaningFloors: {
    type: Sequelize.STRING,
  },
  sameColor: {
    type: Sequelize.STRING,
  },
  cleaningWindows: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.ProjectImage = sequelize.define("project_image", {
  project_id: {
    type: Sequelize.INTEGER,
  },
  image: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.ProjectRoom = sequelize.define("project_rooms", {
  project_id: {
    type: Sequelize.INTEGER,
  },
  roomType: {
    type: Sequelize.STRING,
  },
  windows: {
    type: Sequelize.STRING,
  },
  doors: {
    type: Sequelize.STRING,
  },
  closet: {
    type: Sequelize.STRING,
  },
  surfaceCondition: {
    type: Sequelize.STRING,
  },
  crownMolding: {
    type: Sequelize.STRING,
  },
  baseMolding: {
    type: Sequelize.STRING,
  },
  paintingWalls: {
    type: Sequelize.STRING,
  },
  paintingDoors: {
    type: Sequelize.STRING,
  },
  paintingCeiling: {
    type: Sequelize.STRING,
  },
  paintingTrim: {
    type: Sequelize.STRING,
  },
  paintingWindows: {
    type: Sequelize.STRING,
  },
  ceilingWidth: {
    type: Sequelize.STRING,
  },
  ceilingHeight: {
    type: Sequelize.STRING,
  },
  ceilingNewColor: {
    type: Sequelize.STRING,
  },
  ceilingCurrentColor: {
    type: Sequelize.STRING,
  },
  totalArea: {
    type: Sequelize.STRING,
  },
  totalWallsArea: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.ProjectRoomWall = sequelize.define("project_room_wall", {
  project_id: {
    type: Sequelize.INTEGER,
  },
  room_id: {
    type: Sequelize.INTEGER,
  },
  wallWidth: {
    type: Sequelize.STRING,
  },
  wallHeight: {
    type: Sequelize.STRING,
  },
  previousWallpaper: {
    type: Sequelize.STRING,
  },
  newWallpaper: {
    type: Sequelize.STRING,
  },
  previousColor: {
    type: Sequelize.STRING,
  },
  newColor: {
    type: Sequelize.STRING,
  },
  previousDecorative: {
    type: Sequelize.STRING,
  },
  newDecorative: {
    type: Sequelize.STRING,
  },
  previousFaux: {
    type: Sequelize.STRING,
  },
  newFaux: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.ProjectSurfaceType = sequelize.define("project_surface_types", {
  project_id: {
    type: Sequelize.INTEGER,
  },
  paint_surface_type_id: {
    type: Sequelize.INTEGER,
  },
  room_id: {
    type: Sequelize.INTEGER,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.Faq = sequelize.define("faqs", {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  question: {
    type: Sequelize.STRING,
  },
  answer: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.Cms = sequelize.define("cms", {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  cms_type: {
    type: Sequelize.ENUM,
    values: ["about_us", "privacy_policy", "terms_condition", "contact_us"],
  },
  phone_number: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING },
  address: { type: Sequelize.STRING },
  cms_object: { type: Sequelize.JSON },
  title: { type: Sequelize.STRING },
  description: { type: Sequelize.STRING },
  created_at: { type: Sequelize.DATE },
  updated_at: { type: Sequelize.DATE },
});

exports.About_us = sequelize.define("about_us", {
  img1: {
    type: Sequelize.INTEGER,
  },
  img2: {
    type: Sequelize.INTEGER,
  },
  img3: {
    type: Sequelize.STRING,
  },
  img4: {
    type: Sequelize.STRING,
  },
  img5: {
    type: Sequelize.STRING,
  },
  img6: {
    type: Sequelize.STRING,
  },
  heading1: {
    type: Sequelize.STRING,
  },
  heading2: {
    type: Sequelize.STRING,
  },
  heading3: {
    type: Sequelize.STRING,
  },
  heading4: {
    type: Sequelize.STRING,
  },
  heading5: {
    type: Sequelize.STRING,
  },
  heading6: {
    type: Sequelize.STRING,
  },
  heading7: {
    type: Sequelize.STRING,
  },
  heading8: {
    type: Sequelize.STRING,
  },
  description1: {
    type: Sequelize.STRING,
  },
  description2: {
    type: Sequelize.STRING,
  },
  description3: {
    type: Sequelize.STRING,
  },
  description4: {
    type: Sequelize.STRING,
  },
  description5: {
    type: Sequelize.STRING,
  },
  description6: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.Privacy_policy = sequelize.define("privacy_policy", {
  heading: {
    type: Sequelize.INTEGER,
  },
  description1: {
    type: Sequelize.INTEGER,
  },
  description2: {
    type: Sequelize.STRING,
  },
  img: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.Terms_and_condition = sequelize.define("terms_and_condition", {
  heading: {
    type: Sequelize.STRING,
  },
  description1: {
    type: Sequelize.STRING,
  },
  description2: {
    type: Sequelize.STRING,
  },
  img: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.Contact_us = sequelize.define("contact_us", {
  img1: {
    type: Sequelize.STRING,
  },
  img2: {
    type: Sequelize.STRING,
  },
  heading: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.STRING,
  },
  mobile: {
    type: Sequelize.STRING,
  },
  gmail: {
    type: Sequelize.STRING,
  },
  address: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.Helps = sequelize.define("helps", {
  img1: {
    type: Sequelize.INTEGER,
  },
  img2: {
    type: Sequelize.INTEGER,
  },
  img3: {
    type: Sequelize.STRING,
  },
  img4: {
    type: Sequelize.STRING,
  },
  img5: {
    type: Sequelize.STRING,
  },
  img6: {
    type: Sequelize.STRING,
  },
  img7: {
    type: Sequelize.STRING,
  },
  heading1: {
    type: Sequelize.STRING,
  },
  heading2: {
    type: Sequelize.STRING,
  },
  heading3: {
    type: Sequelize.STRING,
  },
  heading4: {
    type: Sequelize.STRING,
  },
  heading5: {
    type: Sequelize.STRING,
  },
  heading6: {
    type: Sequelize.STRING,
  },
  heading7: {
    type: Sequelize.STRING,
  },
  description1: {
    type: Sequelize.STRING,
  },
  description2: {
    type: Sequelize.STRING,
  },
  description3: {
    type: Sequelize.STRING,
  },
  description4: {
    type: Sequelize.STRING,
  },
  description5: {
    type: Sequelize.STRING,
  },
  description6: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.Bid = sequelize.define("bids", {
  project_id: {
    type: Sequelize.INTEGER,
  },
  bid: {
    type: Sequelize.DOUBLE,
  },
  cover_letter: {
    type: Sequelize.STRING,
  },
  painter_id: {
    type: Sequelize.INTEGER,
  },
  status: {
    type: Sequelize.ENUM,
    values: ["pending", "approved", "disapproved", "withdraw", , "expired"],
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.Icons = sequelize.define("icons", {
  icon: {
    type: Sequelize.STRING,
  },
  icon_url: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.Submittion_form = sequelize.define("submittion_forms", {
  name: {
    type: Sequelize.STRING,
  },
  email: {
    type: Sequelize.STRING,
  },
  subject: {
    type: Sequelize.STRING,
  },
  phone_no: {
    type: Sequelize.STRING,
  },
  comment: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.How_to_work = sequelize.define("how_to_works", {
  heading1: {
    type: Sequelize.STRING,
  },
  heading2: {
    type: Sequelize.STRING,
  },
  heading3: {
    type: Sequelize.STRING,
  },
  heading4: {
    type: Sequelize.STRING,
  },
  heading5: {
    type: Sequelize.STRING,
  },
  description1: {
    type: Sequelize.STRING,
  },
  description2: {
    type: Sequelize.STRING,
  },
  description3: {
    type: Sequelize.STRING,
  },
  description4: {
    type: Sequelize.STRING,
  },
  description5: {
    type: Sequelize.STRING,
  },
  image1: {
    type: Sequelize.STRING,
  },
  image2: {
    type: Sequelize.STRING,
  },
  image3: {
    type: Sequelize.STRING,
  },
  image4: {
    type: Sequelize.STRING,
  },
  image5: {
    type: Sequelize.STRING,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.Payment = sequelize.define("payments", {
  project_id: {
    type: Sequelize.INTEGER,
  },
  painter_id: {
    type: Sequelize.INTEGER,
  },
  amount: {
    type: Sequelize.DOUBLE,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

exports.chats = sequelize.define("chats", {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  sender_id: { type: Sequelize.STRING },
  receiver_id: { type: Sequelize.STRING },
  room_id: { type: Sequelize.STRING },
  message:{ type: Sequelize.STRING },
  primary_room_id :{ type: Sequelize.STRING },
  created_at: { type: Sequelize.DATE },
  updated_at: { type: Sequelize.DATE },
});



exports.Room = sequelize.define("rooms", {
  sender_id: { type: Sequelize.INTEGER },
  receiver_id: { type: Sequelize.INTEGER },
  project_id:{ type: Sequelize.STRING },
  room_id: { type: Sequelize.STRING },
  created_at: { type: Sequelize.DATE },
  updated_at: { type: Sequelize.DATE },
});




exports.Reporting_reasons_listings = sequelize.define(
  "reporting_reasons_listings",
  {
    reason: { type: Sequelize.STRING },
  }
);

exports.Reporting_reasons = sequelize.define("reporting_reasons", {
  painter_id: { type: Sequelize.INTEGER },
  project_id: { type: Sequelize.INTEGER },
  reason: { type: Sequelize.STRING },
  created_at: { type: Sequelize.DATE },
  updated_at: { type: Sequelize.DATE },
});




exports.newProject = sequelize.define("newProjects", {
  id: {
    type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true
  },
  project_title: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.STRING,
  },
  startDate: {
    type: Sequelize.DATE,
  },
  endDate: {
    type: Sequelize.DATE,
  },
  customer_id: {
    type: Sequelize.STRING,
  },
  creater_type: {
    type: Sequelize.ENUM,
    values: ["basic","advanced"],
  },
  project_type: {
    type: Sequelize.ENUM,
    values: ["interior", "exterior"],
  },
  bid_status: {
    type: Sequelize.ENUM,
    values: ["approved", "rejected" , "pending" , "withdrawl" , "expired"],
  },
  home_type: {
    type: Sequelize.ENUM,
    values: ["home", "business",]
  },
  property_type: {
    type: Sequelize.ENUM,
    values: ["apartment", "house", "condo","townhouse"],
  },
  room_type: {
    type: Sequelize.JSON
    // defaultValue: [],
  },
  what_painted: {
    type: Sequelize.JSON
    // defaultValue: [],
  },
  closet: {
    type: Sequelize.ENUM,
    values: ["no", "small", "medium","large"],
  },
  surface_condition: {
    type: Sequelize.STRING,
    // values: ["needHelpinMeasurment", "bad", "fair","good" ,"poor"],
  },
  material: {
    type: Sequelize.ENUM,
    values: ["wood", "brick", "siding","stucco" ],
  },
  crown_molding: {
    type: Sequelize.ENUM,
    values: ["yes", "no" ],
  },
  base_molding: {
    type: Sequelize.ENUM,
    values: ["yes", "no" ],
  },
  status: {
    type: Sequelize.ENUM,
    values: ["approved", "pending" , "rejected"],
  },
  room_no: {
    type: Sequelize.STRING,
  },
  number_of_window: {
    type: Sequelize.STRING,
  },
  number_of_doors: {
    type: Sequelize.STRING,
  },
  ceiling: {
    type: Sequelize.STRING,
  },
  surface_area: {
    type: Sequelize.STRING,
  },
  surface_area_to_be_painted: {
    type: Sequelize.STRING,
  },
  height_of_ceiling: {
    type: Sequelize.STRING,
  },
  finishing: {
    type: Sequelize.JSON
  },
  wallpaper: {
    type: Sequelize.STRING,
  },
  providing_items: {
    type: Sequelize.STRING,
  },
  other_thing_painter_to_do: {
    type: Sequelize.JSON,
  },
  other_kinds_of_property: {
    type: Sequelize.JSON,
  },
  jobtime: {
    type: Sequelize.STRING,
  },
  type_of_painting: {
    type: Sequelize.STRING,
  },
  project_applicable: {
    type: Sequelize.JSON,
  },
  gutters: {
    type: Sequelize.STRING,
  },
  roof_modeling: {
    type: Sequelize.STRING,
  },

  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
});

