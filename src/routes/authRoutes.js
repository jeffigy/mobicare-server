const {
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  checkCookie,
} = require("../controllers/authController");
const authRoutes = require("express").Router();

authRoutes.route("/verify/:token?").get(verifyEmail);
authRoutes.route("/login").post(login);
authRoutes.route("/refresh").get(refresh);
authRoutes.route("/logout").post(logout);
authRoutes.route("/forgot-password").post(forgotPassword);
authRoutes.route("/reset-password/:token?").patch(resetPassword);
authRoutes.route("/check-cookie").get(checkCookie);

module.exports = authRoutes;
