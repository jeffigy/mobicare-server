const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendVerficationEmail");
const jwt = require("jsonwebtoken");

const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} = require("../utils/config");

const verifyEmail = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiration: { $gt: Date.now() },
  }).exec();

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
      UserInfo: {
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

      await sendVerificationEmail(
        foundUser.email,
        "Email Verification",
        "Please verify your email by clicking the following link:",
        "Thank you for registering with MobiCare. Please verify your email by clicking the following link:",
        `/auth/verify/${verificationToken}`
      );

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
  console.log(req.cookies);

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

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return res
      .status(404)
      .json({ message: "This email is not associated with any account" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = resetToken;
  user.passwordResetTokenExpiration = Date.now() + 3600000;

  await user.save();

  await sendVerificationEmail(
    user.email,
    "Reset Email",
    "reset you password by clicking the link: ",
    "To reset the password of your account please click the following link: ",
    `/auth/reset-password/${resetToken}`
  );

  return res.json({ message: "Reset link was sent to your email" });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  console.log({ token });

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  if (!password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "passwords do not match" });
  }

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpiration: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Reset password token is invalid or has expired" });
  }

  const hashedPwd = await bcrypt.hash(password, 10);

  user.password = hashedPwd;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiration = undefined;

  await user.save();

  res.json({ message: "Password successfully reset" });
};

module.exports = {
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
