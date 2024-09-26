const repairRoutes = require("express").Router();
const {
  newRepair,
  getAllRepairs,
  updateRepair,
  deleteRepair,
  getRepair,
} = require("../controllers/repairController");
const verifyJWT = require("../middleware/verifyJWT");

repairRoutes.use(verifyJWT);

repairRoutes
  .route("/")
  .get(getAllRepairs)
  .post(newRepair)
  .patch(updateRepair)
  .delete(deleteRepair);

repairRoutes.route("/:id").get(getRepair);

module.exports = repairRoutes;
