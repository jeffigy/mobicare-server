const { model, Schema } = require("mongoose");
const { transformToJSON } = require("../utils/mongooseUtils");

const userSchema = new Schema({
  email: String,
  password: String,
  roles: {
    type: [String],
    default: ["User"],
  },
  active: {
    type: Boolean,
    default: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpiration: Date,
});

transformToJSON(userSchema);

module.exports = model("User", userSchema);
