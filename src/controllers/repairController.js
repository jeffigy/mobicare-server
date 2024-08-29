const Repair = require("../models/Repair");

const newRepair = async (req, res) => {
  const {
    customer: { name, number, email },
    device: { type, brand, model, imeiOrSerialNumber },
    problemDescription: { issueCategory, details },
    // additionalInfo: { images },
    status,
  } = req.body;

  if (
    !name ||
    !number ||
    !email ||
    !type ||
    !brand ||
    !model ||
    !imeiOrSerialNumber ||
    !issueCategory ||
    !details
  ) {
    return res.status(400).json({ message: "Some inputs are missing" });
  }

  const dbEntry = await Repair.findOne({
    "customer.name": name,
    "device.imeiOrSerialNumber": imeiOrSerialNumber,
    status: "pending",
  });

  if (dbEntry) {
    return res.status(409).json({ message: "Duplicate entry found" });
  }

  const newRepair = await Repair.create({
    customer: { name, number, email },
    device: { type, brand, model, imeiOrSerialNumber },
    problemDescription: { issueCategory, details },
    // additionalInfo: { images },
    status,
  });

  if (newRepair) {
    return res.status(201).json({
      message: "New Repair Entry successfully created",
    });
  } else {
    return res
      .status(400)
      .json({ message: "Failed to create a new repair entry" });
  }
};

module.exports = { newRepair };
