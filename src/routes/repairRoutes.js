const repairRoutes = require("express").Router();
const { newRepair } = require("../controllers/repairController");

repairRoutes.route("/").post(newRepair);

module.exports = repairRoutes;
