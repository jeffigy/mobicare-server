const userRoutes = require("express").Router();
const {
  getAllUsers,
  newUser,
  editUser,
} = require("../controllers/userController");
const verifyJWT = require("../middleware/verifyJWT");

userRoutes.use(verifyJWT);

userRoutes.route("/").get(getAllUsers).post(newUser).patch(editUser);

module.exports = userRoutes;
