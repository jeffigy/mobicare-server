import { getAllUsers, signup } from "../controllers/authController.mjs";
import { Router } from "express";
const authRoutes = Router();

authRoutes.route("/").get(getAllUsers);
authRoutes.route("/signup").post(signup);

export default authRoutes;
