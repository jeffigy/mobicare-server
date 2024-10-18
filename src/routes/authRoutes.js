const {
  verifyEmail,
  login,
  refresh,
  logout,
  getUserProfile,
  updateUserName,
  changeUserPassword,
} = require("../controllers/authController");
const authRoutes = require("express").Router();

authRoutes.route("/profile").get(getUserProfile);
authRoutes.route("/profile/name").patch(updateUserName);
authRoutes.route("/profile/password").patch(changeUserPassword);
authRoutes.route("/verify/:token?").get(verifyEmail);
authRoutes.route("/login").post(login);
authRoutes.route("/refresh").get(refresh);
authRoutes.route("/logout").post(logout);
module.exports = authRoutes;
