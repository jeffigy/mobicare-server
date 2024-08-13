const {
  FRONTEND_URL,
  MAILER_USER,
  MAILER_PASSWORD,
  PORT,
} = require("./config");
const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${
    FRONTEND_URL ? FRONTEND_URL : "http://localhost:" + PORT
  }/auth/verify/${token}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: MAILER_USER,
      pass: MAILER_PASSWORD,
    },
  });

  const mailOptions = {
    to: email,
    from: `"MobiCare" <${MAILER_USER}>`,
    subject: "Email Verification",
    text: `Please verify your email by clicking the following link: ${verificationUrl}`,
    html: `
      <p>
        Thank you for registering with MobiCare. Please verify your email by clicking the following link: 
        <a href="${verificationUrl}">Link</a>
      </p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
