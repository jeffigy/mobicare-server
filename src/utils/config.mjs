import { config } from "dotenv";
config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

const MAILER_USER = process.env.MAILER_USER;
const MAILER_PASSWORD = process.env.MAILER_PASSWORD;
const FRONTEND_URL = process.env.FRONTEND_URL;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export {
  PORT,
  MONGODB_URI,
  MAILER_PASSWORD,
  MAILER_USER,
  FRONTEND_URL,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET,
};
