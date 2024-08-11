import User from "../models/User.mjs";
import bcrypt from "bcrypt";

const getAllUsers = async (req, res) => {
  const users = await User.find({}).exec();
  if (users.length === 0) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
};

const signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const duplicateEmail = await User.findOne({ email }).exec();

  if (duplicateEmail) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const hashedPwd = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashedPwd,
  });

  const savedUser = await user.save();

  if (savedUser) {
    return res.status(200).json(savedUser);
  }
};

export { getAllUsers, signup };
