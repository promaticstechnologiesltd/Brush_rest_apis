const {
  User,
  Project,
  ProjectImage,
  ProjectRoom,
  ProjectSurfaceType,
  Category,
  ProjectDetails,
  ProjectTags,
  ProjectRoomWall,
  Bid,
  Room,
  chats,
  newProject
} = require("./models");

/**********************   Project  **********************/

Project.hasMany(ProjectImage, {
  foreignKey: "project_id",
  as: "projectImages",
});

Project.hasMany(ProjectRoom, {
  foreignKey: "project_id",
  as: "projectRooms",
});

Project.hasMany(ProjectSurfaceType, {
  foreignKey: "project_id",
  as: "projectSurfaceTypes",
});

Project.belongsTo(User, {
  foreignKey: "customer_id",
  as: "customerData",
});

// ProjectRoom.belongsTo(Category, {
//   foreignKey: "room_type_id",
//   as: "roomTypeData",
// });

ProjectSurfaceType.belongsTo(Category, {
  foreignKey: "paint_surface_type_id",
  as: "paintSurfaceData",
});

Project.hasOne(ProjectDetails, {
  foreignKey: "id",
  as: "projectDetails",
});
Project.hasMany(ProjectRoom, {
    foreignKey: "project_id",
  sourceKey:"id",
  as: "rooms",
});
Project.hasOne(ProjectTags, {
  foreignKey: "id",
  as: "tags",
});
ProjectRoom.belongsTo(ProjectRoomWall, {
  foreignKey: "project_id",
  as: "walls",
});
Project.belongsTo(User, {
  foreignKey: "customer_id",
  as: "customerDetails",
});
ProjectDetails.hasMany(Bid, {
  foreignKey: "project_id",
  as: "bids",
});
ProjectDetails.hasOne(Bid, {
  foreignKey: "project_id",
  as: "single_bid",
});
Project.belongsTo(ProjectDetails, {
  foreignKey: "id",
  as: "project_sub_details",
});
ProjectDetails.hasMany(ProjectImage, {
  foreignKey: "project_id",
  as: "project_images",
});
Bid.belongsTo(Project, {
  foreignKey: "project_id",
  as: "project_details",
});
Bid.belongsTo(User, {
  foreignKey: "painter_id",
  as: "painter_details",
});
Bid.hasMany(ProjectImage, {
  foreignKey: "project_id",
  sourceKey:"project_id",
  as: "project_images",
});
Bid.belongsTo(ProjectRoomWall, {
  foreignKey: "project_id",
  as: "project_walls",
});
Bid.belongsTo(ProjectTags, {
  foreignKey: "project_id",
  as: "project_tags",
});
Bid.belongsTo(ProjectDetails, {
  foreignKey: "project_id",
  as: "project_sub_details",
});


// my code ===================

// Project.belongsTo(Bid, {
//   foreignKey: "id",
//   sourceKey:"project_id",
//   as: "project_detailss",
// });
// Project.belongsTo(User, {
//   foreignKey: "customer_id",
//   as: "painter_detailss",
// });
// Project.hasMany(ProjectImage, {
//   foreignKey: "project_id",
//   sourceKey:"id",
//   as: "project_images",
// });
// Project.belongsTo(ProjectRoomWall, {
//   foreignKey: "id",
//   as: "project_wallss",
// });
// Project.belongsTo(ProjectTags, {
//   foreignKey: "id",
//   as: "project_tagss",
// });
// Project.belongsTo(ProjectDetails, {
//   foreignKey: "id",
//   sourceKey:"project_id",
//   as: "project_sub_detailss",
// });


// Bid.belongsTo(User, {
//   foreignKey: "painter_id",
//   as: "customerDetails",
// });


ProjectDetails.hasOne(Bid, {
  foreignKey: "project_id",
  as: "Bids",
});



Bid.hasOne(ProjectTags, {
  foreignKey: "project_id",
  sourceKey:"project_id",
  as: "tags",
});


Bid.hasMany(ProjectRoom, {
  foreignKey: "id",
  as: "rooms",
});


Room.belongsTo(ProjectDetails, {
  foreignKey: "project_id",
  target: 'project_id',
  as: "Project_details",
});


Room.belongsTo(User, {
  foreignKey: "receiver_id",
  target: 'id',
  as: "userData",
});






chats.belongsTo(Room, {
  foreignKey: "room_id",
  targetKey: 'room_id',
  as: "room_details",
});





chats.belongsTo(User, {
  foreignKey: "receiver_id",
  target: 'id',
  as: "userData",
});



//  new association foe new model //

newProject.hasMany(ProjectImage, {
  foreignKey: "project_id",
  as: "images",
});


newProject.hasOne(ProjectTags, {
  foreignKey: "project_id",
  as: "tags",
});



newProject.belongsTo(User, {
  foreignKey: "customer_id",
  as: "customerDetails",
});


newProject.hasMany(Bid, {
  foreignKey: "project_id",
  as: "bids",
});



Bid.belongsTo(newProject, {
  foreignKey: "project_id",
  as: "Project_details",
});



Room.belongsTo(newProject, {
  foreignKey: "project_id",
  as: "project_details",
});
