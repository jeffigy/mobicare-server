import { model, Schema } from "mongoose";
import { transformToJSON } from "../utils/mongooseUtils.mjs";

const userSchema = new Schema({
  email: String,
  password: String,
  roles: {
    type: [String],
    default: ["User"],
  },
  active: Boolean,
  verified: {
    type: Boolean,
    default: false,
  },
  // verificationToken: String,
  // verificationDate: Date,
});

transformToJSON(userSchema);

const User = model("User", userSchema);

export default User;
