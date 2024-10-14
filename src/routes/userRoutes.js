const userRoutes = require("express").Router();
const { getAllUsers, newUser } = require("../controllers/userController");
const verifyJWT = require("../middleware/verifyJWT");

userRoutes.use(verifyJWT);

userRoutes.route("/").get(getAllUsers).post(newUser);

module.exports = userRoutes;
