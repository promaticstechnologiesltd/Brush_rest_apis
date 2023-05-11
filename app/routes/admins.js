const controller = require("../controllers/admins");
const validate = require("../controllers/admins.validate");
const express = require("express");
const router = express.Router();
require("../../config/passport");
const passport = require("passport");
const requireAuth = passport.authenticate("jwt", {
  session: false,
});
const trimRequest = require("trim-request");

/*
 * Users routes
 */

// ****** ****  CATEGORY **** *********
router.post(
  "/addCategory",
  trimRequest.all,
  requireAuth,
  controller.addCategory
); //random when admin work started place it admin side


router.post(
  "/creditValueADMIN",
  trimRequest.all,
  // requireAuth,
  controller.creditValueADMIN
); 


router.patch(
  "/ModifyValueADMIN",
  trimRequest.all,
  // requireAuth,
  controller.ModifyValueADMIN
);





router.get(
  "/getcreditvalue",
  trimRequest.all,
  // requireAuth,
  controller.getcreditvalue
);




router.get(
  "/getCategory/:type",
  trimRequest.all,
  requireAuth,
  controller.getCategory
);

// ****** ****  Project  **** *********

router.post(
  "/createProjectBasic",
  trimRequest.all,
  requireAuth,
  controller.createProjectBasic
);

router.get(
  "/getProjects",
  trimRequest.all,
  requireAuth,
  controller.getProjects
);

router.get(
  "/getProjectById/:project_id",
  trimRequest.all,
  requireAuth,
  controller.getProjectById
);
// ****** ****  Profile **** *********

router.post(
  "/changePassword",
  trimRequest.all,
  requireAuth,
  validate.changePassword,
  controller.changePassword
);

router.post(
  "/changeEmailOtp",
  trimRequest.all,
  requireAuth,
  validate.changeEmailOtp,
  controller.changeEmailOtp
);

router.post(
  "/changeEmail",
  trimRequest.all,
  requireAuth,
  validate.changeEmail,
  controller.changeEmail
);

router.patch(
  "/updateProfile",
  trimRequest.all,
  requireAuth,
  controller.updateProfile
);

router.post(
  "/editAdminProfile",
  trimRequest.all,
  requireAuth,
  controller.editAdminProfile
);

router.get("/getProfile", trimRequest.all, requireAuth, controller.getProfile);

router.post("/editUser", trimRequest.all,validate.id, controller.editUser);

router.get("/deleteUser", trimRequest.all,validate.id, controller.deleteUser);

router.get("/viewUser", trimRequest.all,validate.id, controller.viewUser);

router.get("/deleteProject", trimRequest.all,validate.id, controller.deleteProject);

router.post("/updateProject", trimRequest.all, controller.updateProject);

router.post("/addFaq", trimRequest.all,validate.addFaq, controller.addFaq);

router.get("/getFaqList", trimRequest.all, controller.getFaqList);

router.post("/updateFaq", trimRequest.all,validate.id, controller.updateFaq);

router.get("/viewFaq", trimRequest.all,validate.id, controller.viewFaq);

router.get("/deleteFaq", trimRequest.all,validate.id, controller.deleteFaq);

router.post("/addCms", trimRequest.all,validate.addCms, controller.addCms);

router.get("/getCmsList", trimRequest.all,validate.getCmsList, controller.getCmsList);

router.post("/updateCms", trimRequest.all,validate.id, controller.updateCms);

router.get("/viewCms", trimRequest.all,validate.id, controller.viewCms);

router.get("/deleteCms", trimRequest.all,validate.id, controller.deleteCms);

router.post("/uploadCmsImage", trimRequest.all, controller.uploadCmsImage);

router.post("/uploadImage", trimRequest.all, controller.uploadImage);

router.get("/get/cms",trimRequest.all, controller.getCms );
router.get("/getjobByID",trimRequest.all, controller.getjobByID );
router.get("/getContactUs",trimRequest.all, controller.getContactUs );
router.get("/getnumbers",trimRequest.all, controller.getnumbers );
router.patch("/update/cms",trimRequest.all, controller.updateCms );
router.post("/icon",trimRequest.all, controller.icon );
router.get("/icon",trimRequest.all, controller.getIcon );
router.get("/bids",trimRequest.all, controller.getBids );
router.post("/create/user",trimRequest.all, controller.createUser );
router.patch("/project/approval",trimRequest.all, controller.projectApproval );

module.exports = router;

