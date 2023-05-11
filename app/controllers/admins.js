const uuid = require("uuid");
const { handleError, buildErrObject } = require("../middleware/utils");
const db = require("../middleware/admins_db");
const fs = require("fs");
const emailer = require("../middleware/emailer");
const auth = require("../middleware/auth");
const axios = require("axios");
const OTP_EXPIRED_TIME = 5;
const { Blob, Buffer } = require("buffer");
var bcrypt = require("bcrypt");
// const STORAGE_PATH = process.env.STORAGE_PATH;
// const { uploadFile, getUserIdFromToken } = require("../shared/helpers");
const {
  getItem,
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

exports.createProjectBasic = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const data = req.body;
    data.customer_id = req.user.id;

    data.start_date = new Date(data.start_date);
    data.end_date = new Date(data.end_date);

    // create a new user
    const createProject = await Models.Project.create(data, {
      transaction: transaction,
    });
    if (req.files && Array.isArray(req.files.images)) {
      for await (const imgData of req.files.images) {
        const image = await uploadFile({
          file: imgData,
          path: `${STORAGE_PATH}/projectImages`,
        });
        const projectImageObj = {
          image: image,
          project_id: createProject.id,
        };
        const addProjectImages = await Models.ProjectImage.create(
          projectImageObj,
          { transaction: transaction }
        );
      }
    } else if (req.files && !Array.isArray(req.files.images)) {
      const image = await uploadFile({
        file: req.files.images,
        path: `${STORAGE_PATH}/projectImages`,
      });
      const projectImageObj = {
        image: image,
        project_id: createProject.id,
      };
      const addProjectImages = await Models.ProjectImage.create(
        projectImageObj,
        { transaction: transaction }
      );
    }

    if (data.room_type_ids && typeof data.room_type_ids === "string") {
      data.room_type_ids = JSON.parse(data.room_type_ids);
    }

    if (Array.isArray(data.room_type_ids)) {
      for await (const roomTypeId of data.room_type_ids) {
        const projectRoomObj = {
          room_type_id: roomTypeId,
          project_id: createProject.id,
        };
        const addProjectRoom = await Models.ProjectRoom.create(projectRoomObj, {
          transaction: transaction,
        });
      }
    }
    if (data.surface_type_ids && typeof data.surface_type_ids === "string") {
      data.surface_type_ids = JSON.parse(data.surface_type_ids);
    }
    if (Array.isArray(data.surface_type_ids)) {
      for await (const surfaceTypeId of data.surface_type_ids) {
        const projectRoomSurfaceObj = {
          paint_surface_type_id: surfaceTypeId,
          project_id: createProject.id,
        };
        const addProjectRoomSurface = await Models.ProjectSurfaceType.create(
          projectRoomSurfaceObj,
          { transaction: transaction }
        );
      }
    }

    // this code will not be executed because the update operation failed
    await transaction.commit();
    return res.status(200).json({
      code: 200,
      projectAdded: true,
    });
  } catch (error) {
    // rollback the transaction
    await transaction.rollback();
    handleError(res, error);
  }
};

exports.getProjects = async (req, res) => {
  try {
    const data = { ...req.query, ...req.params };
    data.limit ? data.limit : undefined;
    data.offset ? data.offset : undefined;
    const condition = {};
    if (data.project_id) {
      // condition.id = data.project_id
    };
    if (data.status) {
      condition.status = data.status
    };
    if (data.projectType) {
      condition.projectType = data.projectType
    };
    const include = [
      {
        model: Models.ProjectImage,
        as: "projectImages",
        attributes: { exclude: ["created_at", "updated_at"] }
      },
      {
        model: Models.ProjectDetails,
        as: "projectDetails",
        attributes: { exclude: ["created_at", "updated_at"] }
      },
      {
        model: Models.ProjectRoom,
        as: "rooms",
        attributes: { exclude: ["created_at", "updated_at"] },
        include: {
          model: Models.ProjectRoomWall,
          as: "walls",
          attributes: { exclude: ["created_at", "updated_at"] }
        },
      },
      {
        model: Models.ProjectTags,
        as: "tags",
        attributes: { exclude: ["created_at", "updated_at"] }
      }

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
    });
  } catch (error) {
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

    const USER = await getItem(Models.Admin, data.user_id);

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

exports.changeEmailOtp = async (req, res) => {
  try {
    const data = req.body;

    data.user_id = req.user.id;

    const user = await getItem(Models.Admin, data.user_id);

    user.forgot_password_otp = Math.floor(1000 + Math.random() * 9000);
    user.forgot_password_otp_time = new Date(
      new Date().getTime() + OTP_EXPIRED_TIME * 60 * 1000
    );
    console.log("-------------------->", user);
    await Promise.all([
      emailer.sendOtpOnEmail(
        req.getLocale(),
        {
          email: data.new_email,
          name: user.full_name,
          otp: user.forgot_password_otp,
        },
        "RESET EMAIL OTP"
      ),
      user.save(),
    ]);


    return res.status(200).json({
      code: 200,
      message: "OTP SENT",
    });
  } catch (error) {
    handleError(res, error);
  }
};



exports.forgetADminPassword = async (req, res) => {
  try {
    const data = req.body;

    data.user_id = req.user.id;

    const user = await getItem(Models.Admin, data.user_id);

    user.forgot_password_otp = Math.floor(1000 + Math.random() * 9000);
    user.forgot_password_otp_time = new Date(
      new Date().getTime() + OTP_EXPIRED_TIME * 60 * 1000
    );
    console.log("-------------------->", user);
    await Promise.all([
      emailer.sendOtpOnEmail(
        req.getLocale(),
        {
          email: data.new_email,
          name: user.full_name,
          otp: user.forgot_password_otp,
        },
        "RESET EMAIL OTP"
      ),
      user.save(),
    ]);


    return res.status(200).json({
      code: 200,
      message: "OTP SENT",
    });
  } catch (error) {
    handleError(res, error);
  }
};

const checkOTP = async (user, otp) => {
  return new Promise((resolve, reject) => {
    if (user.forgot_password_otp_time < new Date())
      reject(utils.buildErrObject(409, "OTP_EXPIRED"));
    if (user.forgot_password_otp != otp)
      reject(utils.buildErrObject(409, "INVALID_OTP"));
    resolve(true);
  });
};

exports.changeEmail = async (req, res) => {
  try {
    const data = req.body;

    data.user_id = req.user.id;

    const user = await getItem(Models.Admin, data.user_id);

    if (await checkOTP(user, data.otp)) {
      user.forgot_password_otp_time = new Date();
      user.forgot_password_otp = 0;
      await user.save();
    }

    user.email = data.new_email;
    await user.save();

    return res.status(200).json({
      code: 200,
      emailChange: true,
    });
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

    const USER = await updateItem(Models.User, { id: data.user_id }, data);

    return res.status(200).json({
      code: 200,
      profileUpdated: true,
    });
  } catch (error) {
    handleError(res, error);
  }
};




exports.creditValueADMIN = async (req, res) => {
  try {
    const data = req.body;

    // data.user_id = req.user.id;
    const bids =   await getItemAccQuery(Models.Bid, {id:data.id});
      if(bids) {
        const USER = await createItem(Models.creditvalues,  data);
         res.status(200).json({
          code: 200,
          profileUpdated: USER,
        });
      }
  } catch (error) {
    handleError(res, error);
  }
};




exports.ModifyValueADMIN = async (req, res) => {
  try {
    const data = req.body;

    // data.user_id = req.user.id;
    const update =  await updateItem(Models.modifycreditvalue, data, {id:data.id})
       

    return res.status(200).json({
      code: 200,
      response: update,
    });
  } catch (error) {
    handleError(res, error);
  }
};



exports.getcreditvalue = async (req, res) => {
  try {
    const data = req.body;

    // data.user_id = req.user.id;
    const bids =   await Models.creditvalues.findAll({})
    

    return res.status(200).json({
      code: 200,
      response: bids,
    });
  } catch (error) {
    handleError(res, error);
  }
};















exports.editAdminProfile = async (req, res) => {
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

    await updateItem(Models.Admin, { id: data.user_id }, data);

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


exports.editUser = async (req, res) => {
  try {
    const data = req.body;

    await updateItem(Models.User, data, { id: data.id });

    return res.status(200).json({
      code: 200,
      message: "updated",
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const data = req.query;
    const user = await getItem(Models.User, data.id)
    await Models.User.destroy({ where: { id: data.id } });
    await Models.Project.destroy({ where: { customer_id: data.id } });
    await Models.ProjectImage.destroy({ where: { project_id: user.id } });
    await Models.ProjectDetails.destroy({ where: { id: user.id } });
    await Models.ProjectRoom.destroy({ where: { id: user.id } });
    await Models.ProjectRoomWall.destroy({ where: { id: user.id } });
    await Models.ProjectTags.destroy({ where: { id: user.id } });

    return res.status(200).json({
      code: 200,
      message: "deleted",
    });
  } catch (error) {
    handleError(res, error);
  }
};




exports.viewUser = async (req, res) => {
  try {
    const data = req.query;

    const user = await getItem(Models.User, data.id)


    return res.status(200).json({
      code: 200,
      User: user,
    });
  } catch (error) {
    handleError(res, error);
  }
};


exports.deleteProject = async (req, res) => {
  try {
    const data = req.query;

    await Models.Project.destroy({ where: { id: data.id } });
    await Models.ProjectImage.destroy({ where: { project_id: data.id } });
    await Models.ProjectDetails.destroy({ where: { id: data.id } });
    await Models.ProjectRoom.destroy({ where: { id: data.id } });
    await Models.ProjectRoomWall.destroy({ where: { id: data.id } });
    await Models.ProjectTags.destroy({ where: { id: data.id } });

    return res.status(200).json({
      code: 200,
      message: "deleted",
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateProject = async (req, res) => {
  try {
    const data = req.body;

    // await Models.Project.destroy({where:{id:data.id}});
     const resp =  await updateItem(Models.newProject, data,{ id: data.id });
  //  const resp   =   await Models.newProject.update({status:data.status},{ where: { id: data.id } })
    return res.status(200).json({
      code: 200,
      message: resp,
    });
  } catch (error) {
    handleError(res, error);
  }
};


exports.addFaq = async (req, res) => {
  try {
    const data = req.body;

    // await Models.Project.destroy({where:{id:data.id}});
    await createItem(Models.Faq, data);

    return res.status(200).json({
      code: 200,
      message: "created",
    });
  } catch (error) {
    handleError(res, error);
  }
};


exports.getFaqList = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    const whereObj = {};

    if (req.query.search) {
      const like = { [Op.like]: "%" + req.query.search + "%" };

      whereObj[Op.or] = [
        { question: like },
        { answer: like },
      ];
    }


    const list = await Models.Faq.findAndCountAll({
      where: whereObj,
      offset: offset,
      limit: limit,
    })
    // const list = await getItemsAccQuery(Models.Faq , {} , limit , offset);

    return res.status(200).json({
      code: 200,
      count: list.count,
      list: list.rows,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateFaq = async (req, res) => {
  try {
    const data = req.body;

    await updateItem(Models.Faq, { id: data.id }, data);

    return res.status(200).json({
      code: 200,
      message: "updated",
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.viewFaq = async (req, res) => {
  try {
    const data = req.query;

    const faq = await getItem(Models.Faq, data.id)


    return res.status(200).json({
      code: 200,
      Faq: faq,
    });
  } catch (error) {
    handleError(res, error);
  }
};


exports.deleteFaq = async (req, res) => {
  try {
    const data = req.query;

    await Models.Faq.destroy({ where: { id: data.id } });

    return res.status(200).json({
      code: 200,
      message: "deleted",
    });
  } catch (error) {
    handleError(res, error);
  }
};


exports.addCms = async (req, res) => {
  try {
    const data = req.body;

    if (data.cms_object === "string") {
      data.cms_object = JSON.parse(data.cms_object);
    }

    await createItem(Models.Cms, data);


    return res.status(200).json({
      code: 200,
      message: "created",
    });
  } catch (error) {
    handleError(res, error);
  }
};



exports.getCmsList = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    const list = await Models.Cms.findAndCountAll({
      where: {},
      offset: offset,
      limit: limit,
    })
    // const list = await getItemsAccQuery(Models.Faq , {} , limit , offset);

    return res.status(200).json({
      code: 200,
      count: list.count,
      list: list.rows,
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateCms = async (req, res) => {
  try {
    const data = req.body;

    if (data.cms_object === "string") {
      data.cms_object = JSON.parse(data.cms_object);
    }

    await updateItem(Models.Cms, { id: data.id }, data);

    return res.status(200).json({
      code: 200,
      message: "updated",
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.viewCms = async (req, res) => {
  try {
    const data = req.query;

    const Cms = await getItem(Models.Cms, data.id)


    return res.status(200).json({
      code: 200,
      Cms: Cms,
    });
  } catch (error) {
    handleError(res, error);
  }
};


exports.deleteCms = async (req, res) => {
  try {
    const data = req.query;

    await Models.Cms.destroy({ where: { id: data.id } });

    return res.status(200).json({
      code: 200,
      message: "deleted",
    });
  } catch (error) {
    handleError(res, error);
  }
};


exports.uploadCmsImage = async (req, res) => {
  try {
    let img;
    if (req.files && req.files.image) {
      img = await uploadFile({
        file: req.files.image,
        path: `${STORAGE_PATH}/cmsImages`,
      });
    }
    return res.status(200).json({
      code: 200,
      image: img,
    });
  } catch (error) {
    handleError(res, error);
  }
};


exports.getCms = async (req, res) => {
  try {
    const data = req.query;
    let response;
    if (data.type == 'about_us') {
      response = await Models.About_us.findOne({ where: { id: 1 } })
    } else if (data.type == 'privacy_policy') {
      response = await Models.Privacy_policy.findOne({ where: { id: 1 } })
    } else if (data.type == 'terms_and_condition') {
      response = await Models.Terms_and_condition.findOne({ where: { id: 1 } })
    } else if (data.type == 'contact_us') {
      response = await Models.Contact_us.findOne({ where: { id: 1 } })
    } else if (data.type == 'help') {
      response = await Models.Helps.findOne({ where: { id: 1 } })
    }else if (data.type == 'how_to_work') {
      response = await Models.How_to_work.findOne({ where: { id: 1 } })
    }


    res.status(200).json({
      code: 200,
      response: response
    })
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateCms = async (req, res) => {
  try {
    const data = req.body;
    let status;
    if (data.type == 'about_us') {
      await updateItem(Models.About_us, data, { id: 1 });
      status = 'about us updated'
    } else if (data.type == 'privacy_policy') {
      await updateItem(Models.Privacy_policy, data, { id: 1 });
      status = 'privacy policy updated'
    } else if (data.type == 'terms_and_condition') {
      await updateItem(Models.Terms_and_condition, data, { id: 1 });
      status = 'terms and condition updated'
    } else if (data.type == 'contact_us') {
      await updateItem(Models.Contact_us, data, { id: 1 });
      status = 'contact us updated'
    } else if (data.type == 'help') {
      await updateItem(Models.Helps, data, { id: 1 });
      status = 'help updated'
    }else if (data.type == 'how_to_work') {
      await updateItem(Models.How_to_work, data, { id: 1 });
      status = 'how to works updated'
    }

    res.status(200).json({
      code: 200,
      status
    })
  } catch (error) {
    handleError(res, error);
  }
};

exports.uploadImage = async (req, res) => {
  try {
    const imgs = req.files;
    const data = req.body;
    const response = await db.uploadImg(imgs, data.path)
    res.status(200).json({
      code: 200,
      response: response
    })
  } catch (error) {
    handleError(res, error);
  }
};

exports.icon = async (req, res) => {
  try {
    const data = req.body;
    const response = await db.icons(Models.Icons, data)
    res.status(200).json({
      code: 200,
      response: response
    })
  } catch (error) {
    handleError(res, error);
  }
};

exports.getIcon = async (req, res) => {
  try {
    const data = req.query;
    let response;
    if (data.id) {
      response = await getItem(Models.Icons, data.id);
    } else {
      response = await getItemsAccQueryWidCount(Models.Icons, undefined, undefined, undefined, ["id", "DESC"]);
    }
    res.status(200).json({
      code: 200,
      response: response
    })
  } catch (error) {
    handleError(res, error);
  }
};

exports.getContactUs = async (req, res) => {
  try {
    
    const resp = await Models.Contact_us.findAll({})
    res.status(200).json({data:resp})
  } catch (error) {
    handleError(res, error);
  }
};


exports.getjobByID = async (req, res) => {
  try {
    
  const   response = await Models.Job.findOne({ where: { job_id: req.query.job_id } })
    res.status(200).json({data:response})
  } catch (error) {
    handleError(res, error);
  }
};


exports.getnumbers = async (req, res) => {
  try {
    
  const   usercount = await Models.User.findAndCountAll({ where: { role: "user" } })
  const   paintercount = await Models.User.findAndCountAll({ where: { role: "painter" } })
  const   bidCount = await Models.Bid.findAll({ })
    res.status(200).json({usercount:usercount,paintercount:paintercount, bidCount:bidCount })
  } catch (error) {
    handleError(res, error);
  }
};


exports.getBids = async (req, res) => {
  try {
    const data = req.query;
    let response;
    if (data.id) {
      response = await getItem(Models.Bid, data.id);
    } else {
      const include = [
        {
          model: Models.Project,
          as: "project_details",
          attributes: { exclude: ["created_at", "updated_at"] },
          include:{
            model:Models.User,
            as:"customerDetails",
            attributes: { exclude: ["created_at", "updated_at","decoded_pasword","password"] }
          }
        },
        {
          model: Models.User,
          as: "painter_details",
          attributes: { exclude: ["created_at", "updated_at","decoded_pasword","password"] }
        }
      ]
      response = await getItemsWithInclude(Models.Bid, undefined, include, undefined, undefined, ["id", "DESC"]);
    }
    res.status(200).json({
      code: 200,
      response: response
    })
  } catch (error) {
    handleError(res, error);
  }
};

exports.createUser = async (req, res) => {
  try {
    const data = req.body;
    const locale = req.getLocale();
    const randomNumber = Math.floor(Math.random() * 1000000).toString();
    data.password = bcrypt.hashSync(randomNumber, 10);
    data.decoded_pasword = randomNumber;
    data.verification = uuid.v4();
    const doesEmailExists = await emailer.emailExists(data.email);
    if (!doesEmailExists) {
      let response = await createItem(Models.User, data);
      await emailer.passwordSent(locale, response);
      res.status(200).json({
        code: 200,
        response
      })
    }
  } catch (error) {
    handleError(res, error);
  }
};

exports.projectApproval = async (req, res) => {
  try {
    const data = req.body;
    await updateItem(Models.Project, data, { id: data.id });
    res.status(200).json({
      code: 200,
      status: data.status == 'approved' ? "approved" : "rejected"
    })
  } catch (error) {
    handleError(res, error);
  }
};




