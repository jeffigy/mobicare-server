const User = require("../models/User");

const getAllUsers = async (req, res) => {
  const users = await User.find({}).exec();
  if (users.length === 0) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
};

module.exports = { getAllUsers };
