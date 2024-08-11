import "express-async-errors";
import express from "express";
import authRoutes from "./routes/authRoutes.mjs";
import connectDB from "./utils/connectDB.mjs";

connectDB();

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

export default app;
