require("express-async-errors");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const repairRoutes = require("./routes/repairRoutes");
const connectDB = require("./utils/connectDB");
const corsOptions = require("./utils/corsOptions");
const morgan = require("./middleware/morgan");
const userRoutes = require("./routes/userRoutes");

connectDB();

const app = express();
app.use(morgan);
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/repairs", repairRoutes);
app.use("/users", userRoutes);
module.exports = app;
