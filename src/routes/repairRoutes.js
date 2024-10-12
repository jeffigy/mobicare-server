const repairRoutes = require("express").Router();
const {
  newRepair,
  getAllRepairs,
  updateRepair,
  deleteRepair,
} = require("../controllers/repairController");
const verifyJWT = require("../middleware/verifyJWT");

repairRoutes.use(verifyJWT);

repairRoutes.route("/").get(getAllRepairs).post(newRepair).patch(updateRepair);

repairRoutes.route("/:id").delete(deleteRepair);
module.exports = repairRoutes;
