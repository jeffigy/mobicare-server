const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendVerficationEmail");
const jwt = require("jsonwebtoken");
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} = require("../utils/config");

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

const verifyEmail = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiration: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Verification token is invalid or has expired" });
  }

  user.verified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiration = undefined;

  await user.save();

  const accessToken = jwt.sign(
    {
      userInto: {
        email: user.email,
        roles: user.roles,
      },
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign({ email: user.email }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
};

module.exports = { getAllUsers, signup, verifyEmail };
