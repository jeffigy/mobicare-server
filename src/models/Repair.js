const { model, Schema } = require("mongoose");
const { transformToJSON } = require("../utils/mongooseUtils");

const repairSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  customer: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    number: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
    },
  },
  device: {
    type: {
      type: String,
      required: true,
      enum: ["smartphone", "tablet", "laptop", "other"],
    },
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    imeiOrSerialNumber: {
      type: String,
      required: false,
    },
  },
  problemDescription: {
    issueCategory: {
      type: String,
      required: true,
      enum: [
        "screen replacement",
        "battery replacement",
        "water damage",
        "software issues",
        "other",
      ],
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
  },
  additionalInfo: {
    images: {
      type: [String],
      required: false,
    },
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "in progress", "completed", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

repairSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

transformToJSON(repairSchema);

module.exports = model("Repair", repairSchema);
