import { config } from "dotenv";
config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

export { PORT, MONGODB_URI };
