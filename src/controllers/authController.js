const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendVerficationEmail");
const jwt = require("jsonwebtoken");

const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} = require("../utils/config");

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
    expiresIn: "30d",
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
        message:
          "Account not verified. A new verification link has been sent to your email",
      });
    }

    return res.status(401).json({
      message:
        "Account not verified. A verification link has already been sent. Please check your email.",
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
    { expiresIn: "30d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
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
  getUserProfile,
  verifyEmail,
  login,
  refresh,
  logout,
  updateUserName,
  changeUserPassword,
};
