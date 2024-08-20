const {
  getAllUsers,
  signup,
  verifyEmail,
  login,
} = require("../controllers/authController");
const authRoutes = require("express").Router();

authRoutes.route("/").get(getAllUsers);
authRoutes.route("/signup").post(signup);
authRoutes.route("/verify/:token?").get(verifyEmail);
authRoutes.route("/login").post(login);

module.exports = authRoutes;
