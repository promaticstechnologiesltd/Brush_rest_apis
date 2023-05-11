const uuid = require("uuid");
const { handleError, buildErrObject } = require("../middleware/utils");
const db = require("../middleware/db");
const fs = require("fs");
const Jimp = require("jimp");

const auth = require("../middleware/auth");
const axios = require("axios");

const { Blob, Buffer } = require("buffer");
const emailer = require("../middleware/emailer");
const {
  getItem,
  getItemCustom,
  getItemAccQuery,
  createItem,
  updateItem,
  deleteCustom,
  getItemsAccQuery,
  getItemsAccQueryWidCount,
  getItemWithInclude,
  getItemsWithInclude,
} = require("../shared/core");
const { uploadFile, getUserIdFromToken } = require("../shared/helpers");
const { Op, Model, where } = require("sequelize");

const sequelize = require("../../config/mysql");

const STORAGE_PATH_HTTP = process.env.STORAGE_PATH_HTTP;
const STORAGE_PATH = process.env.STORAGE_PATH;

// * models
const Models = require("../models/models");

/**
 * Upload Media function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */

/********************
 * Public functions *
 ********************/
exports.addCategory = async (req, res) => {
  try {
    const data = req.body;
    if (req.files && req.files.image) {
      data.image = await uploadFile({
        file: req.files.image,
        path: `${STORAGE_PATH}/categoryImages`,
      });
    }

    const item = await createItem(Models.Category, data);

    return res.status(200).json({
      code: 200,
      category: item,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getCategory = async (req, res) => {
  try {
    const data = { ...req.query, ...req.params };
    data.limit ? data.limit : undefined;
    data.offset ? data.offset : undefined;

    const condition = {
      type: data.type,
    };
    const items = await getItemsAccQuery(
      Models.Category,
      condition,
      data.limit,
      data.offset
    );

    return res.status(200).json({
      code: 200,
      categories: items,
    });
  } catch (error) {
    handleError(res, error);
  }
};

getMimeTypeFromBase64 = (base64Data) => {
  const base64Header = "data:image/";
  const base64Index = base64Data.indexOf(base64Header);

  if (base64Index === 0) {
    const mimeType = base64Data.substring(
      base64Header.length,
      base64Data.indexOf(";base64")
    );
    return mimeType;
  }

  // Decode the base64 string
  const decodedData = atob(base64Data);

  // Check the file signature to determine the MIME type
  const byte1 = decodedData.charCodeAt(0);
  const byte2 = decodedData.charCodeAt(1);
  const byte3 = decodedData.charCodeAt(2);

  if (byte1 === 0xff && byte2 === 0xd8 && byte3 === 0xff) {
    return "image/jpeg";
  } else if (byte1 === 0x89 && byte2 === 0x50 && byte3 === 0x4e) {
    return "image/png";
  } else if (byte1 === 0x47 && byte2 === 0x49 && byte3 === 0x46) {
    return "image/gif";
  } else {
    return null;
  }
};

exports.createProjectBasic = async (req, res) => {
  try {
    const data = req.body;
    data.customer_id = req.user.id;
    var createProject = await Models.Project.create(data); // project creation
    if (data.images) {
      // project images
      for (let image of data.images) {
        await Models.ProjectImage.create({
          project_id: createProject.id,
          image: image.name,
        });
      }
    }
    if (data.projectDetails) {
      // project details
      data.projectDetails.project_id = createProject.id;
      data.projectDetails.startDate = new Date();
      data.projectDetails.dueDate = new Date();
      await Models.ProjectDetails.create(data.projectDetails);
    }
    if (data.rooms) {
      // project rooms
      for (let room of data.rooms) {
        room.project_id = createProject.id;
        var createProjectRooms = await Models.ProjectRoom.create(room);
        if (room.walls) {
          for (let wall of room.walls) {
            wall.project_id = createProject.id;
            wall.room_id = createProjectRooms.id;
            await Models.ProjectRoomWall.create(wall);
          }
        }
      }
    }
    if (data.tags) {
      // project tags
      data.tags.project_id = createProject.id;
      await Models.ProjectTags.create(data.tags);
    }

    return res.status(200).json({
      code: 200,
      projectAdded: true,
    });
  } catch (error) {
    console.log("error in createProjectBasic-->", error);
    handleError(res, error);
  }
};




exports.uploadMultipleProjectImgs = async (req, res) => {
  try {
    let multipleImgs = [];
    let singleImg = [];
    if (req.files && Array.isArray(req.files.images)) {
      for await (const imgData of req.files.images) {
        const image = await uploadFile({
          file: imgData,
          path: `${STORAGE_PATH}/projectImages`,
        });
        multipleImgs.push(
          `https://production.promaticstechnologies.com/brush_rest_apis/public/projectImages/${image}`
        );
      }
    } else if (req.files && !Array.isArray(req.files.images)) {
      var image = await uploadFile({
        file: req.files.images,
        path: `${STORAGE_PATH}/projectImages`,
      });
      singleImg.push(
        `https://production.promaticstechnologies.com/brush_rest_apis/public/projectImages/${image}`
      );
    }
    res.status(200).json({
      code: 200,
      imgs:
        req.files && Array.isArray(req.files.images) ? multipleImgs : singleImg,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const data = req.body;
    const [
      project,
      ProjectDetails,
      ProjectTags,
      ProjectImage,
      ProjectRoomWall,
      ProjectRoom,
    ] = await Promise.all([
      deleteCustom(Models.Project, { id: data.project_id }),
      deleteCustom(Models.ProjectDetails, { project_id: data.project_id }),
      deleteCustom(Models.ProjectTags, { project_id: data.project_id }),
      deleteCustom(Models.ProjectImage, { project_id: data.project_id }),
      deleteCustom(Models.ProjectRoomWall, { project_id: data.project_id }),
      deleteCustom(Models.ProjectRoom, { project_id: data.project_id }),
    ]);
    res.status(200).json({
      code: 200,
      project,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getProjects = async (req, res) => {
  try {
    const data = req.body;
    const where = {};
    data.limit ? +data.limit : undefined;
    data.offset ? +data.offset : undefined;
    const condition = {
      customer_id: req.user.id,
    };

    console.log("user_id--------------->", req.user.id);
    if (data.project_id) {
      condition.id = data.project_id;
    }
    if (req.user.role == "painter") {
      where.painter_id = req.user.id;
    }
    if (data.status) {
      condition.status = data.status;
    }
    if (data.search) {
      condition["$projectDetails.title$"] = {
        [Op.like]: "%" + data.search + "%",
      };
    }
    if (data.surfaceArea) {
      condition["$tags.surfaceArea$"] = { [Op.in]: data.surfaceArea };
    }
    if (data.surfaceCondition) {
      condition["$tags.surfaceCondition$"] = data.surfaceCondition;
    }
    if (data.projectType) {
      condition["projectType"] = data.projectType;
    }
    const include = [
      {
        model: Models.User,
        as: "customerDetails",
        attributes: [
          "id",
          "full_name",
          "email",
          "profile_image",
          "phone_number",
          "full_address",
          "city",
          "state",
          "zip_code",
          "status",
        ],
      },
      {
        model: Models.ProjectImage,
        as: "projectImages",
        attributes: { exclude: ["created_at", "updated_at"] },
      },
      {
        model: Models.ProjectDetails,
        as: "projectDetails",
        attributes: {
          exclude: ["created_at", "updated_at"],
          include: [
            [
              sequelize.literal(
                "(SELECT COUNT(*) FROM bids WHERE bids.project_id = projectDetails.project_id)"
              ),
              "bid_count",
            ],
          ],
        },
        include: {
          model: Models.Bid,
          as: "bids",
          attributes: { exclude: ["created_at", "updated_at"] },
          include: {
            model: Models.User,
            as: "painter_details",
            attributes: {
              exclude: [
                "created_at",
                "updated_at",
                "decoded_pasword",
                "password",
              ],
            },
          },
        },
      },
      {
        model: Models.ProjectRoom,
        as: "rooms",
        attributes: { exclude: ["created_at", "updated_at"] },
        include: {
          model: Models.ProjectRoomWall,
          as: "walls",
          attributes: { exclude: ["created_at", "updated_at"] },
        },
      },
      {
        model: Models.ProjectTags,
        as: "tags",
        attributes: { exclude: ["created_at", "updated_at"] },
      },
    ];
    const { count, rows } = await getItemsWithInclude(
      Models.Project,
      condition,
      include,
      data.limit,
      data.offset
    );

    return res.status(200).json({
      code: 200,
      count: count,
      projects: rows,
      // project_status:value
    });
  } catch (error) {
    console.log("error----------_>", error);
    handleError(res, error);
  }
};

exports.getProjectsPainterSide = async (req, res) => {
  try {
    const data = req.body;
    // const where = {
    //   "$projectDetails.single_bid.painter_id$" : req.user.id
    // };
    data.limit ? +data.limit : undefined;
    data.offset ? +data.offset : undefined;
    const condition = {
      // painter_id: req.user.id
    };

    console.log("user_id--------------->", req.user.id);
    if (data.project_id) {
      condition.project_id = data.project_id;
    }

    // if (data.status) {
    //   condition.status = data.status
    // };
    // if (data.search) {
    //   condition[
    //     "$projectDetails.title$"
    //   ] = { [Op.like]: "%" + data.search + "%" };
    // }
    // if (data.surfaceArea) {
    //   condition[
    //     "$tags.surfaceArea$"
    //   ] = { [Op.in]: data.surfaceArea };
    // }
    // if (data.surfaceCondition) {
    //   condition[
    //     "$tags.surfaceCondition$"
    //   ] = data.surfaceCondition;
    // }
    // if (data.projectType) {
    //   condition["projectType"] = data.projectType;
    // }
    const include = [
      {
        model: Models.ProjectImage,
        as: "project_images",
        attributes: { exclude: ["created_at", "updated_at"] },
      },
      {
        model: Models.Project,
        as: "project_details",
        attributes: {
          include: [
            [
              sequelize.literal(
                "(SELECT COUNT(*) FROM bids WHERE bids.project_id = project_details.id)"
              ),
              "bid_count",
            ],
          ],
          exclude: ["created_at", "updated_at"],
        },
        include: {
          model: Models.User,
          as: "customerDetails",
          attributes: [
            "id",
            "full_name",
            "email",
            "profile_image",
            "phone_number",
            "full_address",
            "city",
            "state",
            "zip_code",
            "status",
          ],
        },
      },
      {
        model: Models.ProjectDetails,
        as: "project_sub_details",
        attributes: {
          exclude: ["created_at", "updated_at"],
        },
      },
      {
        model: Models.ProjectRoomWall,
        as: "project_walls",
        attributes: { exclude: ["created_at", "updated_at"] },
      },
      {
        model: Models.ProjectTags,
        as: "project_tags",
        attributes: { exclude: ["created_at", "updated_at"] },
      },
      {
        model: Models.User,
        as: "painter_details",
        attributes: {
          exclude: ["created_at", "updated_at", "decoded_pasword", "password"],
        },
      },
    ];
    const { count, rows } = await getItemsWithInclude(
      Models.Bid,
      condition,
      include,
      data.limit,
      data.offset
    );

    return res.status(200).json({
      code: 200,
      count: count,
      projects: rows,
    });
  } catch (error) {
    console.log("error----------_>", error);
    handleError(res, error);
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const data = { ...req.query, ...req.params };

    const condition = {
      id: data.project_id,
    };
    const include = [
      {
        model: Models.ProjectImage,
        as: "projectImages",
      },
      {
        model: Models.ProjectRoom,
        as: "projectRooms",
        include: {
          model: Models.Category,
          as: "roomTypeData",
        },
      },
      {
        model: Models.ProjectSurfaceType,
        as: "projectSurfaceTypes",
        include: {
          model: Models.Category,
          as: "paintSurfaceData",
        },
      },
    ];
    const projectData = await getItemWithInclude(
      Models.Project,
      condition,
      include
    );

    return res.status(200).json({
      code: 200,
      projectData: projectData,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const data = req.body;

    data.user_id = req.user.id;

    const USER = await getItem(Models.User, data.user_id);

    const isPasswordMatch = await auth.checkPassword(
      data.old_password,
      USER.password
    );

    if (!isPasswordMatch) {
      throw buildErrObject(422, "WRONG_OLD_PASSWORD");
    }

    USER.password = data.new_password;

    await USER.save();

    return res.status(200).json({
      code: 200,
      passwordChange: true,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateBid = async (req, res) => {
  try {
    const data = req.body;
    const Bid = await Models.Bid.findOne({ where: { id: data.id } });
    if (Bid.status == "pending") {
      const USER = await updateItem(Models.Bid, data, { id: data.id });
      res.status(200).json({
        code: 200,
        response: USER,
      });
    } else {
      res.status(200).json({
        code: 200,
        response: "NOTHING CHANGED",
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const data = req.body;

    data.user_id = req.user.id;

    if (req.files && req.files.profile_image) {
      // check if image
      var image = await uploadFile({
        file: req.files.profile_image,
        path: STORAGE_PATH + "/usersImages",
      });
      data.profile_image = image;
    }

    const USER = await updateItem(Models.User, data, { id: data.user_id });

    return res.status(200).json({
      code: 200,
      profileUpdated: true,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const data = { ...req.query, ...req.params };
    data.user_id = req.user.id;
    const condition = {
      id: data.user_id,
    };
    const item = await getItemAccQuery(Models.User, condition);

    return res.status(200).json({
      code: 200,
      profileData: item,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getCms = async (req, res) => {
  try {
    const data = req.query;
    let response;
    if (data.type == "about_us") {
      response = await Models.About_us.findOne({ where: { id: 1 } });
    } else if (data.type == "privacy_policy") {
      response = await Models.Privacy_policy.findOne({ where: { id: 1 } });
    } else if (data.type == "terms_and_condition") {
      response = await Models.Terms_and_condition.findOne({ where: { id: 1 } });
    } else if (data.type == "contact_us") {
      response = await Models.Contact_us.findOne({ where: { id: 1 } });
    } else if (data.type == "help") {
      response = await Models.Helps.findOne({ where: { id: 1 } });
    } else if (data.type == "how_to_work") {
      response = await Models.How_to_work.findOne({ where: { id: 1 } });
    }

    res.status(200).json({
      code: 200,
      response: response,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getRoom = async (req, res) => {
  try {
    const id = req.params.id;
    res.status(200).json({
      code: 200,
      room: await Models.ProjectRoom.findOne({ where: id }),
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.bidsOnPainterSide = async (req, res) => {
  try {
    const data = req.query;
    const id = req.user.id;
    let response;
    if (data.id) {
      const include = [
        {
          model: Models.Project,
          as: "project_details",
          attributes: {
            include: [
              [
                sequelize.literal(`(
                SELECT COUNT(*)
                FROM projects AS bidd
                WHERE
                bidd.id = project_details.id
            )`),
                "bid_count",
              ],
            ],
          },
        },
        {
          model: Models.ProjectDetails,
          as: "project_sub_details",

          include: {
            model: Models.ProjectImage,
            as: "project_images",
          },
        },
        // {
        //   model: Models.ProjectDetails,
        //   as: "projectDetails",
        //   attributes: {
        //     exclude: ["created_at", "updated_at"],
        //     include: [
        //       [
        //         sequelize.literal('(SELECT COUNT(*) FROM bids WHERE bids.project_id = projectDetails.project_id)'),
        //         'bid_count'
        //       ]
        //     ]
        //   },
        //   include: {
        //     model: Models.Bid,
        //     as: "Bids",
        //     where:{
        //       [Op.not] :{status:"approved"}
        //     },
        //     // where:where,
        //     attributes: { exclude: ["created_at", "updated_at"] },
        //     include: {
        //       model: Models.User,
        //       as: "painter_details",
        //       attributes: { exclude: ["created_at", "updated_at", "decoded_pasword", "password"] },
        //     }
        //   }
        // },
        {
          model: Models.ProjectRoom,
          as: "rooms",
          attributes: { exclude: ["created_at", "updated_at"] },
          include: {
            model: Models.ProjectRoomWall,
            as: "walls",
            attributes: { exclude: ["created_at", "updated_at"] },
          },
        },
        {
          model: Models.ProjectTags,
          as: "tags",
          attributes: { exclude: ["created_at", "updated_at"] },
        },
      ];
      // const include = {

      //   // required:true,
      //   model: Models.Project,
      //   as: "project_details",
      //   attributes: {
      //     include: [
      //       [
      //         sequelize.literal(`(
      //           SELECT COUNT(*)
      //           FROM projects AS bidd
      //           WHERE
      //           bidd.id = project_details.id
      //       )`),
      //         "bid_count",
      //       ],]

      //   },

      //   include: {
      //   model: Models.ProjectRoom,
      //   as: "rooms",
      //   attributes: { exclude: ["created_at", "updated_at"] },
      //   },

      //   include: {
      //   model: Models.ProjectTags,
      //   as: "tags",
      //   attributes: { exclude: ["created_at", "updated_at"] },
      //   },

      //   include: {
      //     model: Models.ProjectDetails,
      //     as: "project_sub_details",

      //     include: {
      //       model: Models.ProjectImage,
      //       as: "project_images",
      //     }
      //   },

      // }

      response = await getItemWithInclude(
        Models.Bid,
        { painter_id: req.user.id, id: data.id },
        include
      );
      // response = await Models.Bid.findAll({
      //   where:{ painter_id: req.user.id, id: data.id },
      //   include:[include],
      //   // attributes: {
      //   //   include: [
      //   //     [
      //   //       sequelize.literal(`(
      //   //         SELECT COUNT(*)
      //   //         FROM projects AS bidd
      //   //         WHERE
      //   //         bidd.id = bids.project_id
      //   //     )`),
      //   //       "bid_count",
      //   //     ],]

      //   // },
      // })
    } else {
      let condition = {
        painter_id: req.user.id,
      };
      if (data.status) {
        condition.status = data.status;
      }
      const include = {
        model: Models.Project,
        as: "project_details",
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM projects AS bidd
                WHERE
                bidd.id = project_details.id
            )`),
              "bid_count",
            ],
          ],
        },
        include: {
          model: Models.ProjectDetails,
          as: "project_sub_details",
          include: {
            model: Models.ProjectImage,
            as: "project_images",
          },
        },
      };
      // response = await getItemsWithInclude(Models.Bid, condition, include, undefined, undefined, ["id", "DESC"]);
      response = await Models.Bid.findAll({
        where: condition,
        include: include,
        // attributes: {
        //   include: [
        //     [
        //       sequelize.literal(`(
        //         SELECT COUNT(*)
        //         FROM projects AS bidd
        //         WHERE
        //         bidd.id = bids.project_id
        //     )`),
        //       "bid_count",
        //     ],]

        // },
      });
    }
    // const finddetails = await Models.ProjectDetails.findOne({where:{
    //   project_id:data.id
    // }})
    res.status(200).json({
      code: 200,
      count: response.length,
      response: response,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getProjectsonpainterside = async (req, res) => {
  try {
    const data = req.body;
    const where = {};

    data.limit ? parseInt(data.limit) : undefined;
    data.offset ? parseInt(data.offset) : undefined;
    const condition = {
      [Op.not]: { bid_status: "approved" },
      // customer_id: req.user.id,
      status: "approved",
      // painter_id:req.user.id
    };
    // condition.painter_id = req.user.id

    console.log("user_id--------------->", req.user.id);
    if (data.project_id) {
      condition.id = data.project_id;
    }
    // if (req.user.role == "painter") {
    //   where.customer_id = req.user.id;
    // }
    // if (data.status) {
    //   condition.status = "approved"
    // };
    if (data.search) {
      condition["$projectDetails.title$"] = {
        [Op.like]: "%" + data.search + "%",
      };
    }
    if (data.surfaceArea) {
      condition["$tags.surfaceArea$"] = { [Op.in]: data.surfaceArea };
    }
    if (data.surfaceCondition) {
      condition["$tags.surfaceCondition$"] = data.surfaceCondition;
    }
    if (data.projectType) {
      condition["projectType"] = data.projectType;
    }
    const include = [
      {
        model: Models.User,
        as: "customerDetails",
        attributes: [
          "id",
          "full_name",
          "email",
          "profile_image",
          "phone_number",
          "full_address",
          "city",
          "state",
          "zip_code",
          "status",
        ],
      },
      {
        model: Models.ProjectImage,
        as: "projectImages",
        attributes: { exclude: ["created_at", "updated_at"] },
      },
      {
        model: Models.ProjectDetails,
        as: "projectDetails",

        attributes: {
          exclude: ["created_at", "updated_at"],
          include: [
            [
              sequelize.literal(
                "(SELECT COUNT(*) FROM bids WHERE bids.project_id = projectDetails.project_id)"
              ),
              "bid_count",
            ],
          ],
        },
        include: {
          required: false,
          model: Models.Bid,
          as: "Bids",
          // where: {
          //   [Op.not]: { status: "approved" },
          // },
          // where:where,
          attributes: { exclude: ["created_at", "updated_at"] },
          include: {
            model: Models.User,
            as: "painter_details",
            attributes: {
              exclude: [
                "created_at",
                "updated_at",
                "decoded_pasword",
                "password",
              ],
            },
          },
        },
      },
      {
        model: Models.ProjectRoom,
        as: "rooms",
        attributes: { exclude: ["created_at", "updated_at"] },
        include: {
          model: Models.ProjectRoomWall,
          as: "walls",
          attributes: { exclude: ["created_at", "updated_at"] },
        },
      },
      {
        model: Models.ProjectTags,
        as: "tags",
        attributes: { exclude: ["created_at", "updated_at"] },
      },
    ];
    console.log("condition", condition);
    console.log(data.offset);

    const { count, rows } = await getItemsWithInclude(
      Models.Project,
      condition,
      include,
      data.limit,
      data.offset
    );

    console.log("rows=======", rows);
    return res.status(200).json({
      code: 200,
      count: rows.length,
      projects: rows,
    });
  } catch (error) {
    console.log("error----------_>", error);
    handleError(res, error);
  }
};



exports.getcreditvalue = async (req, res) => {
  try {
    const data = req.body;

    data.user_id = req.user.id;
    const bids = await Models.creditvalues.findOne({});

    return res.status(200).json({
      code: 200,
      response: bids,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getcreditvalueforModify = async (req, res) => {
  try {
    const data = req.body;

    data.user_id = req.user.id;
    const bids = await Models.modifycreditvalue.findOne({});

    return res.status(200).json({
      code: 200,
      response: bids,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.bidsOnUserSide = async (req, res) => {
  try {
    const data = req.body;
    const response = [];
    const { count, rows } = await Models.Bid.findAndCountAll({
      where: data,
    });
    res.status(200).json({
      code: 200,
      count: count,
      response: rows,
    });
  } catch (error) {
    handleError(res, error);
  }
};



exports.submittionForm = async (req, res) => {
  try {
    const data = req.body;
    res.status(200).json({
      code: 200,
      form: await createItem(Models.Submittion_form, data),
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.bidById = async (req, res) => {
  try {
    const id = req.params.id;
    const include = {
      model: Models.User,
      as: "painter_details",
      attributes: { exclude: ["created_at", "updated_at"] },
    };
    res.status(200).json({
      code: 200,
      bid: await getItemWithInclude(Models.Bid, { id: id }, include),
    });
  } catch (error) {
    handleError(res, error);
  }
};

// exports.bidApproval = async (req, res) => {
//   try {
//     const id = req.params.id
//     res.status(200).json({
//       code: 200,
//       bid: await updateItem(Models.Bid, req.body, { id: id })
//     })
//   } catch (error) {
//     handleError(res, error);
//   }
// };

exports.paymentFromPainter = async (req, res) => {
  try {
    const data = req.body;
    res.status(200).json({
      code: 200,
      payment: await createItem(Models.Payment, data),
    });
  } catch (error) {
    handleError(res, error);
  }
};

// exports.createRoom = async (req, res) => {
//   try {
//     const data = req.body;
//     const obj = {

//     }
//     res.status(200).json({
//       code: 200,
//       room: await db.createChatRoom(Models.Room, data),
//     });
//   } catch (error) {
//     handleError(res, error);
//   }
// };

exports.createroom = async (req, res) => {
  try {
    const data = req.body;
    console.log("data---", data);
    const condition = {
      [Op.or]: [
        {
          sender_id: data.sender_id,
          receiver_id: data.receiver_id,
        },
        {
          sender_id: data.receiver_id,
          receiver_id: data.sender_id,
        },
      ],
    };
    console.log("condition---", condition);
    let roomDetail = await getItemAccQuery(Models.Room, condition);
    console.log("roomDetail---", roomDetail);

    if (!roomDetail) {
      let obj = {
        room_id: uuid.v4(),
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
      };
      console.log("roomDetail---", roomDetail);
      roomDetail = await createItem(Models.Room, obj);
    }
    res.status(200).json({ code: 200, data: roomDetail });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getallChat = async (req, res) => {
  try {
    const data = req.query;

    const result = await Models.chats.findAll({
      where: {
        room_id: data.room_id,
        primary_room_id: data.primary_room_id,
      },
      include: [
        {
          model: Models.Room,
          as: "room_details",
          include: {
            model: Models.ProjectDetails,
            as: "Project_details",
          },
        },
        { 
          model: Models.User, 
          as: "userData" 
        },
      ],
    });
    res.status(200).json({
      code: 200,
      data: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getallroom = async (req, res) => {
  try {
    // console.log("result", req.query.type,);
    const id = req.user.id;
    console.log("token--------->", id);

    const result = await Models.Room.findAll({
      where: {
        [Op.or]: [
          {
            sender_id: id,
          },
          { receiver_id: id },
        ],
      },
      include: [
        {
          model: Models.newProject,

          as: "project_details",
        },
        {
          model: Models.User,
          // where:{
          //   sender_id: id,
          // },
          as: "userData",
        },
      ],
    });
    res.status(200).json({
      code: 200,
      data: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.getroomById = async (req, res) => {
  try {
    // console.log("result", req.query.type,);
    const data = req.body;

    const result = await Models.Room.findOne({
      where: {
        id: data.room_id,
      },
      include: [
        {
          model: Models.newProject,

          as: "project_details",
        },
        // {
        //   model: Models.User,
        //   // where:{
        //   //   sender_id: id,
        //   // },
        //   as: "userDatas",
        // },
      ],
    });
    res.status(200).json({
      code: 200,
      data: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.reportingReasonsfromAdmin = async (req, res) => {
  try {
    const data = req.query;
    let condition = {};
    let reasons;
    if (data.id) {
      condition.id = data.id;
      reasons = await getItem(Models.Reporting_reasons_listings, condition.id);
    } else {
      reasons = await getItemsAccQuery(
        Models.Reporting_reasons_listings,
        condition,
        undefined,
        undefined,
        ["id", "DESC"]
      );
    }
    res.status(200).json({
      code: 200,
      reasons,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.reportingReasons = async (req, res) => {
  try {
    const data = req.body;
    data.painter_id = req.user.id;
    res.status(200).json({
      code: 200,
      payment: await createItem(Models.Reporting_reasons, data),
    });
  } catch (error) {
    handleError(res, error);
  }
};

// const findUser = async (email) => {
//   return new Promise((resolve, reject) => {
//     const whereObj = {};

//     Models.User.findOne({
//       where: { email: email },
//     })
//       .then((item) => {
//         if (item) {
//           resolve(item);
//         } else {
//           reject(utils.buildErrObject(422, "User Does Not Exist"));
//         }
//       })
//       .catch((err, item) => {
//         utils.itemNotFound(err, item, reject, "EMAIL NOT FOUND");
//       });
//   });
// };





// ====================================new code from create froject =============================================================================== ///////




exports.createNewProjectBasic = async (req, res) => {
  try {
    const data = req.body;
    data.customer_id = req.user.id;
    if(req.user.role == "customer") { 
            
        data.room_type = data.room_type
         data.room_type = data.room_type
      const createProject = await Models.newProject.create(data);
         
     if (data.images) {
      // project images
      for (let image of data.images) {
        await Models.ProjectImage.create({
          project_id: createProject.id,
          image: image.name,
        });
      }
    }
      
      
      res.status(200).json({
        code: 200,
        response: createProject,
      });
    } else {
      
      throw buildErrObject(422, "WRONG token");
    }
  
  

   
  } catch (error) {
    console.log("error in createProjectBasic-->", error);
    handleError(res, error);
  }
};




exports.getNewProjectforUser = async (req, res) => {
  try {
    const data = req.body;
    const where = {};
    data.limit ? +data.limit : undefined;
    data.offset ? +data.offset : undefined;
    const condition = {
      customer_id: req.user.id,
    };
     
    if (data.project_id) {
      condition.id = data.project_id;
    }
    if (data.status) {
      condition.status = data.status;
    }
    if (data.search) {
      condition[["project_title"] ] = {
        [Op.like]: "%" + data.search + "%",
      };
    }
    if (data.surfaceArea) {
      condition["surface_area"] = { [Op.in]: data.surface_area };
    }
    if (data.surfaceCondition) {
      condition["surface_condition"] = data.surface_condition;
    }
    if (data.projectType) {
      condition["projectType"] = data.projectType;
    }
    const include = [
      {
        model: Models.User,
        as: "customerDetails",
        attributes: [
          "id",
          "full_name",
          "email",
          "profile_image",
          "phone_number",
          "full_address",
          "city",
          "state",
          "zip_code",
          "status",
        ],
      },
      {
        model: Models.ProjectImage,
        as: "images",
        attributes: { exclude: ["created_at", "updated_at"] },
      },
      {
          model: Models.Bid,
          as: "bids",
          attributes: { exclude: ["created_at", "updated_at"] },
          include: {
            model: Models.User,
            as: "painter_details",
            attributes: {
              exclude: [
                "created_at",
                "updated_at",
                "decoded_pasword",
                "password",
              ],
            },
          },
      },
      // {
      //   model: Models.ProjectTags,
      //   as: "tags",
      //   attributes: { exclude: ["created_at", "updated_at"] },
      // },
    ];
    const { count, rows } = await getItemsWithInclude(
      Models.newProject,
      condition,
      include,
      data.limit,
      data.offset
    );

    return res.status(200).json({
      code: 200,
      count: count,
      projects: rows,
      // project_status:value
    });
  } catch (error) {
    console.log("error----------_>", error);
    handleError(res, error);
  }
};





exports.getNewProjectforPainter = async (req, res) => {
  try {
    const data = req.body;
    const where = {};
    data.limit ? +data.limit : undefined;
    data.offset ? +data.offset : undefined;
    const condition = {
      status:"approved",
      [Op.not]: { bid_status: "approved" },

    };
     
    if (data.project_id) {
      condition.id = data.project_id;
    }
    if (data.status) {
      condition.status = data.status;
    }
    if (data.search) {
      condition[["project_title"] ] = {
        [Op.like]: "%" + data.search + "%",
      };
    }
    if (data.surfaceArea) {
      condition["surface_area"] = { [Op.in]: data.surface_area };
    }
    if (data.surfaceCondition) {
      condition["surface_condition"] = data.surface_condition;
    }
    if (data.projectType) {
      condition["projectType"] = data.projectType;
    }
    const include = [
      {
        model: Models.User,
        as: "customerDetails",
        attributes: [
          "id",
          "full_name",
          "email",
          "profile_image",
          "phone_number",
          "full_address",
          "city",
          "state",
          "zip_code",
          "status",
        ],
      },
      {
        model: Models.ProjectImage,
        as: "images",
        attributes: { exclude: ["created_at", "updated_at"] },
      },
    ];
    const { count, rows } = await getItemsWithInclude(
      Models.newProject,
      condition,
      include,
      data.limit,
      data.offset
    );

    return res.status(200).json({
      code: 200,
      count: count,
      projects: rows,
      // project_status:value
    });
  } catch (error) {
    console.log("error----------_>", error);
    handleError(res, error);
  }
};


exports.createBid = async (req, res) => {
  try {
    const data = req.body;
    data.painter_id = req.user.id;
    let response;
    if (req.user.role == "painter") {
      let findBid = await getItemCustom(Models.Bid, {
        painter_id: req.user.id,
        project_id: data.project_id,
        bid: data.bid,
      }).then(async (bid) => {
        if (bid.data == null) {
          response = await createItem(Models.Bid, data);
        } else {
          throw buildErrObject(422, "bid already created");
        }
      });
      res.status(200).json({
        code: 200,
        bid: response,
      });
    } else {
      throw buildErrObject(422, "wrong token");
    }
  } catch (error) {
    handleError(res, error);
  }
};

exports.bidApproval = async (req, res) => {
  try {
    const data = req.body;
    const finddetails = await Models.ProjectDetails.findOne({
      where: {
        project_id: data.id,
      },
    });

    if (data.type == "approved") {
      // let  user = await findUser(data.email);
      const find = await Models.Bid.findOne({
        where: {
          id: data.id,
        },
      });

      const userID = find.painter_id;

      const findusers = await Models.User.findOne({
        where: {
          id: userID,
        },
      });

      const email = findusers.email;
      console.log("email", email);

      const locale = req.getLocale();
      let mailOptions = {
        to: email,
        subject: "Bid Approved",
        name: findusers.full_name,
        otp: "approved",
        // url: `https://production.promaticstechnologies.com:3010/forgotAdminPassword`
      };
      console.log("mailOptions: ", mailOptions);
      emailer.sendEmail(locale, mailOptions, "sendEmail");

      var [approved_bid_status, expired_bid_status, project_status] =
        await Promise.all([
          await updateItem(
            Models.Bid,
            { status: "expired" },
            { project_id: data.project_id }
          ),
          await updateItem(
            Models.Bid,
            { status: "approved" },
            { id: data.id }
          ),
          await updateItem(
            Models.newProject,
            { bid_status: "approved" },
            { id: data.project_id }
          ),
        ]);
    } else if (data.type == "disapproved" || data.type == "withdraw") {
      const locale = req.getLocale();
      const find = await Models.Bid.findOne({
        where: {
          id: data.id,
        },
      });

      const userID = find.painter_id;

      const findusers = await Models.User.findOne({
        where: {
          id: userID,
        },
      });

      let mailOptions = {
        to: findusers.email,
        subject: `Bid ${data.type}`,
        name: findusers.full_name,
        otp: `${data.type}`,
        // url: `https://production.promaticstechnologies.com:3010/forgotAdminPassword`
      };
      console.log("mailOptions: ", mailOptions);
      emailer.sendEmail(locale, mailOptions, "sendEmail");

      var status = await updateItem(
        Models.Bid,
        { status: data.bid_status1 },
        { id: data.id }
      );
    }
    res.status(200).json({
      code: 200,
      bid: data.type == "approved" ? approved_bid_status : status,
    });
  } catch (error) {
    handleError(res, error);
  }
};





exports.NewbidsOnPainterSide = async (req, res) => {
  try {
    const data = req.query;
    const id = req.user.id;
    let response;
    if (data.id) {
      const include = [
        {
          model: Models.newProject,
          as: "Project_details",
          attributes: {
            include: [
              [
                sequelize.literal(`(
                SELECT COUNT(*)
                FROM newProjects AS bidd
                WHERE
                bidd.id = Project_details.id
            )`),
                "bid_count",
              ],
            ],
          },
        },
        // {
        //   model: Models.ProjectDetails,
        //   as: "project_sub_details",

        //   include: {
        //     model: Models.ProjectImage,
        //     as: "project_images",
        //   },
        // },
        
        // {
        //   model: Models.ProjectRoom,
        //   as: "rooms",
        //   attributes: { exclude: ["created_at", "updated_at"] },
        //   include: {
        //     model: Models.ProjectRoomWall,
        //     as: "walls",
        //     attributes: { exclude: ["created_at", "updated_at"] },
        //   },
        // },
        {
          model: Models.ProjectTags,
          as: "tags",
          attributes: { exclude: ["created_at", "updated_at"] },
        },
      ];
     

      response = await getItemWithInclude(
        Models.Bid,
        { painter_id: req.user.id, id: data.id },
        include
      );
    } else {
      let condition = {
        painter_id: req.user.id,
      };
      if (data.status) {
        condition.status = data.status;
      }
      const include = {
        model: Models.newProject,
        as: "Project_details",
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM newProjects AS bidd
                WHERE
                bidd.id = Project_details.id
            )`),
              "bid_count",
            ],
          ],
        },
        // include: {
        //   model: Models.ProjectDetails,
        //   as: "project_sub_details",
        //   include: {
        //     model: Models.ProjectImage,
        //     as: "project_images",
        //   },
        // },
      };
      // response = await getItemsWithInclude(Models.Bid, condition, include, undefined, undefined, ["id", "DESC"]);
      response = await Models.Bid.findAll({
        where: condition,
        include: include,
      });
    }
    res.status(200).json({
      code: 200,
      count: response.length,
      response: response,
    });
  } catch (error) {
    handleError(res, error);
  }
}



exports.deleteProject = async (req, res) => {
  try {
    const data = req.body;
    const [
      project,
      ProjectDetails,
      ProjectTags,
      ProjectImage,
      ProjectRoomWall,
      ProjectRoom,
    ] = await Promise.all([
      deleteCustom(Models.newProject, { id: data.project_id }),
      deleteCustom(Models.ProjectTags, { project_id: data.project_id }),
      deleteCustom(Models.ProjectImage, { project_id: data.project_id }),
      deleteCustom(Models.ProjectRoomWall, { project_id: data.project_id }),
      deleteCustom(Models.ProjectRoom, { project_id: data.project_id }),
    ]);
    res.status(200).json({
      code: 200,
      project,
    });
  } catch (error) {
    handleError(res, error);
  }
};



exports.getjobs = async (req, res) => {
  try {
    const data = req.body;
    const where = {};

    data.limit ? parseInt(data.limit) : undefined;
    data.offset ? parseInt(data.offset) : undefined;
    const condition = {
      bid_status: "approved",
      // customer_id: req.user.id,
      status: "approved",
      // painter_id:req.user.id
    };
    // condition.painter_id = req.user.id

    if (data.project_id) {
      condition.id = data.project_id;
    }
    if (data.status) {
      condition.status = data.status;
    }
    if (data.search) {
      condition[["project_title"] ] = {
        [Op.like]: "%" + data.search + "%",
      };
    }
    if (data.surfaceArea) {
      condition["surface_area"] = { [Op.in]: data.surface_area };
    }
    if (data.surfaceCondition) {
      condition["surface_condition"] = data.surface_condition;
    }
    if (data.projectType) {
      condition["projectType"] = data.projectType;
    }
    const include = [
      {
        model: Models.User,
        as: "customerDetails",
        attributes: [
          "id",
          "full_name",
          "email",
          "profile_image",
          "phone_number",
          "full_address",
          "city",
          "state",
          "zip_code",
          "status",
        ],
      },
      {
        model: Models.ProjectImage,
        as: "images",
        attributes: { exclude: ["created_at", "updated_at"] },
      },
      // {
      //   model: Models.ProjectDetails,
      //   as: "projectDetails",

      //   attributes: {
      //     exclude: ["created_at", "updated_at"],
      //     include: [
      //       [
      //         sequelize.literal(
      //           "(SELECT COUNT(*) FROM bids WHERE bids.project_id = projectDetails.project_id)"
      //         ),
      //         "bid_count",
      //       ],
      //     ],
      //   },
      //   include: {
      //     required: false,
      //     model: Models.Bid,
      //     as: "Bids",
      //     // where: {
      //     //   [Op.not]: { status: "approved" },
      //     // },
      //     // where:where,
      //     attributes: { exclude: ["created_at", "updated_at"] },
      //     include: {
      //       model: Models.User,
      //       as: "painter_details",
      //       attributes: {
      //         exclude: [
      //           "created_at",
      //           "updated_at",
      //           "decoded_pasword",
      //           "password",
      //         ],
      //       },
      //     },
      //   },
      // },
      // {
      //   model: Models.ProjectRoom,
      //   as: "rooms",
      //   attributes: { exclude: ["created_at", "updated_at"] },
      //   include: {
      //     model: Models.ProjectRoomWall,
      //     as: "walls",
      //     attributes: { exclude: ["created_at", "updated_at"] },
      //   },
      // },
      // {
      //   model: Models.ProjectTags,
      //   as: "tags",
      //   attributes: { exclude: ["created_at", "updated_at"] },
      // },
    ];
    console.log("condition", condition);
    console.log(data.offset);

    const { count, rows } = await getItemsWithInclude(
      Models.newProject,
      condition,
      include,
      data.limit,
      data.offset
    );

    console.log("rows=======", rows);
    return res.status(200).json({
      code: 200,
      count: rows.length,
      projects: rows,
    });
  } catch (error) {
    console.log("error----------_>", error);
    handleError(res, error);
  }
};



