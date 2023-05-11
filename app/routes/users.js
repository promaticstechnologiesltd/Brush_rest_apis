const controller = require("../controllers/users");
const validate = require("../controllers/users.validate");
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
router.post("/addCategory", trimRequest.all, controller.addCategory); //random when admin work started place it admin side

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

router.post(
  "/createNewProjectBasic",
  trimRequest.all,
  requireAuth,
  controller.createNewProjectBasic
);




router.post(
  "/upload/multiple/project/imgs",
  trimRequest.all,
  controller.uploadMultipleProjectImgs
);

router.post(
  "/delete/project",
  trimRequest.all,
  requireAuth,
  controller.deleteProject
);

router.post(
  "/getProjects",
  trimRequest.all,
  requireAuth,
  controller.getProjects
);


router.post(
  "/getProjects/painter/side",
  trimRequest.all,
  requireAuth,
  controller.getProjectsPainterSide
);

router.get(
  "/getProjectById/:project_id",
  trimRequest.all,
  requireAuth,
  controller.getProjectById
);

router.post(
  "/getProjectsbypainter",
  trimRequest.all,
  requireAuth,
  controller.getProjectsonpainterside
);




router.post(
  "/getjobs",
  trimRequest.all,
  requireAuth,
  controller.getjobs
);

// ****** ****  Profile **** *********

router.post(
  "/changePassword",
  trimRequest.all,
  requireAuth,
  validate.changePassword,
  controller.changePassword
);

router.patch(
  "/updateProfile",
  trimRequest.all,
  requireAuth,
  controller.updateProfile
);



router.get("/getProfile", trimRequest.all, requireAuth, controller.getProfile);
router.get("/get/cms",trimRequest.all, controller.getCms );

router.get(
  "/getRoom/:id",
  trimRequest.all,
  requireAuth,
  controller.getRoom
);


router.get(
  "/getallChat",
  trimRequest.all,
  controller.getallChat
);


router.get(
  "/getRooms",
  trimRequest.all,
  requireAuth,
  controller.getallroom
);


router.post(
  "/getRoombyId",
  trimRequest.all,
  controller.getroomById
);



router.post(
  "/create/bid",
  trimRequest.all,
  requireAuth,
  controller.createBid
);

router.patch(
  "/bid/approval",
  trimRequest.all,
  requireAuth,
  controller.bidApproval
);

router.patch(
  "/update/bid",
  trimRequest.all,
  // requireAuth,
  controller.updateBid
);


router.get(
  "/get/bids/painter/side",
  trimRequest.all,
  requireAuth,
  controller.bidsOnPainterSide
);

router.post(
  "/submittion/form",
  trimRequest.all,
  controller.submittionForm
);

router.get(
  "/bid/:id",
  trimRequest.all,
  controller.bidById
);

// router.patch(
//   "/bid/approval/:id",
//   trimRequest.all,
//   controller.bidApproval
// );

router.post(
  "/payment/from/painter",
  trimRequest.all,
  controller.paymentFromPainter
);

router.post(
  "/create/room",
  trimRequest.all,
  controller.createroom
);

router.get(
  "/reporting/reasons/listing/from/admin",
  trimRequest.all,
  controller.reportingReasonsfromAdmin
);


router.get(
  "/getcreditvalueforUser",
  trimRequest.all,
  requireAuth,
  controller.getcreditvalue
);

router.get(
  "/getcreditvalueforModify",
  trimRequest.all,
  requireAuth,
  controller.getcreditvalueforModify
);


router.post(
  "/reporting/reasons",
  trimRequest.all,
  requireAuth,
  controller.reportingReasons
);


// =========================================================== new route =========================================================================//



router.get(
  "/getNewProjectforUser",
  trimRequest.all,
  requireAuth,
  controller.getNewProjectforUser
);



router.get(
  "/getNewProjectforPainter",
  trimRequest.all,
  
  controller.getNewProjectforPainter
);


router.get(
  "/get/Allbids/painter/side",
  trimRequest.all,
  requireAuth,
  controller.NewbidsOnPainterSide
);




module.exports = router;
