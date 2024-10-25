const {
  FRONTEND_URL,
  MAILER_USER,
  MAILER_PASSWORD,
  PORT,
} = require("./config");
const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, subject, text, html, url) => {
  const verificationUrl = FRONTEND_URL
    ? FRONTEND_URL + url
    : `http://localhost:${PORT + url}`;

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
    subject: subject,
    text: `${text} ${verificationUrl}`,
    html: `
      <p>
        ${html}
        <a href="${verificationUrl}">Link</a>
      </p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
