const repairRoutes = require("express").Router();
const {
  newRepair,
  getAllRepairs,
  updateRepair,
  deleteRepair,
} = require("../controllers/repairController");

repairRoutes
  .route("/")
  .get(getAllRepairs)
  .post(newRepair)
  .patch(updateRepair)
  .delete(deleteRepair);

module.exports = repairRoutes;
