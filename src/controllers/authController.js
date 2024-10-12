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

  res.status(201).json({
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

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const foundUser = await User.findOne({ email }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }

  if (foundUser && !foundUser.active) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const matchPwd = await bcrypt.compare(password, foundUser.password);

  if (!matchPwd) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }

  if (!foundUser.verified) {
    if (Date.now() > foundUser.verificationTokenExpiration) {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      foundUser.verificationToken = verificationToken;
      foundUser.verificationTokenExpiration = Date.now() + 24 * 60 * 60 * 1000;

      await foundUser.save();

      await sendVerificationEmail(foundUser.email, verificationToken);

      return res.status(401).json({
        message: "A new verification link has been sent to your email",
      });
    }

    return res.status(401).json({
      message:
        "A verification link has already been sent. Please check your email.",
    });
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        email: foundUser.email,
        roles: foundUser.roles,
      },
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { email: foundUser.email },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    seure: true,
    sameSite: "None",
    mageAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
};

const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (error, decoded) => {
    if (error) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const foundUser = await User.findOne({ email: decoded.email }).exec();

    if (!foundUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accessToken = jwt.sign(
      {
        UserInfo: {
          email: foundUser.email,
          roles: foundUser.roles,
        },
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  });
};

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(204);
  }
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleard" });
};

module.exports = {
  getAllUsers,
  getUserProfile,
  signup,
  verifyEmail,
  login,
  refresh,
  logout,
};
