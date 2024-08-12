import User from "../models/User.mjs";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendVerificationEmail from "../utils/sendVerficationEmail.mjs";

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
    email,
    password: hashedPwd,
    verificationToken,
    verificationTokenExpiration,
  });

  await sendVerificationEmail(newUser.email, verificationToken);

  res.status(200).json({
    message: `A verification email has been sent to ${newUser.email}.`,
  });
};

export { getAllUsers, signup };
