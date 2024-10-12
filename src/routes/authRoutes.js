const {
  signup,
  verifyEmail,
  login,
  refresh,
  logout,
  getUserProfile,
} = require("../controllers/authController");
const authRoutes = require("express").Router();

authRoutes.route("/profile").get(getUserProfile);
authRoutes.route("/signup").post(signup);
authRoutes.route("/verify/:token?").get(verifyEmail);
authRoutes.route("/login").post(login);
authRoutes.route("/refresh").get(refresh);
authRoutes.route("/logout").post(logout);
module.exports = authRoutes;
