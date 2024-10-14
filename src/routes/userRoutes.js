const userRoutes = require("express").Router();
const {
  getAllUsers,
  newUser,
  editUser,
  deleteUser,
} = require("../controllers/userController");
const verifyJWT = require("../middleware/verifyJWT");

userRoutes.use(verifyJWT);

userRoutes.route("/").get(getAllUsers).post(newUser).patch(editUser);

userRoutes.route("/:id").delete(deleteUser);

module.exports = userRoutes;
