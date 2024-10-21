const User = require("../models/User");
const bcrypt = require("bcrypt");
const cloudinary = require("../utils/cloudinary");
const getUploadFolder = require("../utils/folderHelper");

const getUserProfile = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  const user = await User.findOne({ email }).exec();
  if (!user) {
    return res.status(404).json({ message: "User not found " });
  }
  res.json(user);
};

const updateUserName = async (req, res) => {
  const { name, id } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = name;
  await user.save();
  return res.status(200).json({ message: "Name successfully updated" });
};

const changeUserPassword = async (req, res) => {
  const { id, currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "New password and confirm password do not match" });
  }

  const foundUser = await User.findById(id).exec();

  if (!foundUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(currentPassword, foundUser.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  foundUser.password = hashedPassword;

  await foundUser.save();

  return res.status(200).json({ message: "Password successfully updated" });
};

const UploadImage = async (req, res) => {
  const { id, uploadType } = req.body;

  if (!uploadType || !id) {
    return res.status(400).json({ message: "upload type and id are required" });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const currentImagePublicId = user.imagePublicId;

  // No need to call cloudinary.uploader.upload again
  const result = req.file; // Image already uploaded by multer

  // If upload is successful, delete the old image
  if (currentImagePublicId) {
    await cloudinary.uploader.destroy(currentImagePublicId); // Delete old image
  }

  user.imageUrl = result.path;
  user.imagePublicId = result.filename;

  await user.save();

  res.status(200).json({
    message: "Image uploaded and profile updated successfully",
  });
};

module.exports = {
  UploadImage,
  getUserProfile,
  updateUserName,
  changeUserPassword,
};
