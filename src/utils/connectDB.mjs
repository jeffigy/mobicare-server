import mongoose from "mongoose";
import { MONGODB_URI } from "./config.mjs";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("connected to db");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
