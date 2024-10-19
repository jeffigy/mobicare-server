const {
  verifyEmail,
  login,
  refresh,
  logout,
} = require("../controllers/authController");
const authRoutes = require("express").Router();

authRoutes.route("/verify/:token?").get(verifyEmail);
authRoutes.route("/login").post(login);
authRoutes.route("/refresh").get(refresh);
authRoutes.route("/logout").post(logout);
module.exports = authRoutes;
