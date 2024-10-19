const {
  //   UploadImage,
  getUserProfile,
  updateUserName,
  changeUserPassword,
} = require("../controllers/profileController");
// const upload = require("../middleware/upload");
const profileRoutes = require("express").Router();

// profileRoutes.route("/").post(upload.single("image"), UploadImage);

profileRoutes.route("/").get(getUserProfile);
profileRoutes.route("/name").patch(updateUserName);
profileRoutes.route("/password").patch(changeUserPassword);

module.exports = profileRoutes;
