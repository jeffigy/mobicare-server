const userRoutes = require("express").Router();
const { getAllUsers } = require("../controllers/userController");
const verifyJWT = require("../middleware/verifyJWT");

userRoutes.use(verifyJWT);

userRoutes.route("/").get(getAllUsers);

module.exports = userRoutes;
