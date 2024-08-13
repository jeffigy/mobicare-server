const {
  getAllUsers,
  signup,
  verifyEmail,
} = require("../controllers/authController");
const authRoutes = require("express").Router();

authRoutes.route("/").get(getAllUsers);
authRoutes.route("/signup").post(signup);
authRoutes.route("/verify/:token?").get(verifyEmail);

module.exports = authRoutes;
