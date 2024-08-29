require("express-async-errors");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const repairRoutes = require("./routes/repairRoutes");
const connectDB = require("./utils/connectDB");

connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/repairs", repairRoutes);

module.exports = app;
