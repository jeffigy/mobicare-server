import {
  getAllUsers,
  signup,
  verifyEmail,
} from "../controllers/authController.mjs";
import { Router } from "express";
const authRoutes = Router();

authRoutes.route("/").get(getAllUsers);
authRoutes.route("/signup").post(signup);
authRoutes.route("/verify/:token").get(verifyEmail);

export default authRoutes;
