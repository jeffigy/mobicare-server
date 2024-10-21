const { model, Schema } = require("mongoose");
const { transformToJSON } = require("../utils/mongooseUtils");

const userSchema = new Schema({
  email: String,
  password: String,
  name: String,
  roles: {
    type: [String],
    default: ["user"],
  },
  active: {
    type: Boolean,
    default: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  imagePublicId: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  verificationToken: String,
  verificationTokenExpiration: Date,
});

transformToJSON(userSchema);

module.exports = model("User", userSchema);
