const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendVerficationEmail");

const getAllUsers = async (req, res) => {
  const { email } = req.query;
  const users = await User.find({ email: { $ne: email } }).exec();
  if (users.length === 0) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
};
const newUser = async (req, res) => {
  const { name, email, password, roles } = req.body;

  if (!name || !email || !password || !roles.length) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  }

  const duplicateEmail = await User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicateEmail) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const hashedPwd = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiration = Date.now() + 24 * 60 * 60 * 1000;

  const newUser = await User.create({
    name,
    email,
    password: hashedPwd,
    verificationToken,
    verificationTokenExpiration,
    roles,
  });

  await sendVerificationEmail(newUser.email, verificationToken);

  res.status(201).json({
    message: `A verification email has been sent to ${newUser.email}.`,
  });
};

const editUser = async (req, res) => {
  const { id, roles, active } = req.body;

  if (!roles.length || typeof active !== "boolean") {
    return res
      .status(400)
      .json({ message: "Roles, and Account status are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.roles = roles;
  user.active = active;

  const updatedUser = await user.save();
  res
    .status(200)
    .json({ message: `User with email ${updatedUser.email} updated` });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.deleteOne();

  return res.status(200).json({ message: "User deleted" });
};

module.exports = { getAllUsers, newUser, editUser, deleteUser };
