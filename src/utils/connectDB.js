const mongoose = require("mongoose");
const { MONGODB_URI } = require("./config");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("connected to db");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
