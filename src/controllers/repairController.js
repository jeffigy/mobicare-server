const Repair = require("../models/Repair");

const getAllRepairs = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortDate = "desc",
    status = [],
  } = req.query;
  const skip = (page - 1) * limit;

  const searchQuery = search
    ? {
        $or: [
          {
            "customer.name": {
              $regex: search.split(" ").join("|"),
              $options: "i",
            },
          },
          {
            "device.model": {
              $regex: search.split(" ").join("|"),
              $options: "i",
            },
          },
        ],
      }
    : {};

  const statusQuery = status.length
    ? { status: { $in: status.split(",") } }
    : {};

  const query = {
    ...searchQuery,
    ...statusQuery,
  };

  const sortDateOrder = sortDate === "asc" ? 1 : -1;

  const repairs = await Repair.find(query)
    .sort({ createdAt: sortDateOrder })
    .skip(skip)
    .limit(parseInt(limit));

  if (!repairs) {
    return res.status(400).json({ message: "No Entries found" });
  }

  const total = await Repair.countDocuments(searchQuery);

  res.json({
    items: repairs,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
  });
};

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

const updateRepair = async (req, res) => {
  const {
    id,
    customer: { name, number, email },
    device: { type, brand, model, imeiOrSerialNumber },
    problemDescription: { issueCategory, details },
    status,
  } = req.body;

  if (
    !id ||
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

  const repair = await Repair.findById(id).exec();
  if (!repair) {
    return res.status(404).json({ message: "Repair entry not found" });
  }

  const duplicate = await Repair.findOne({
    _id: { $ne: id },
    "customer.email": email,
    "device.imeiOrSerialNumber": imeiOrSerialNumber,
    status: "pending",
  });

  if (duplicate) {
    return res
      .status(409)
      .json({ message: "Duplicate entry found with pending status." });
  }

  const updatedRepair = await Repair.findByIdAndUpdate(id, {
    customer: { name, number, email },
    device: { type, brand, model, imeiOrSerialNumber },
    problemDescription: { issueCategory, details },
    status,
  });

  if (!updatedRepair) {
    return res
      .status(500)
      .json({ message: "Failed to update the repair entry" });
  }

  return res.status(200).json({
    message: "Repair entry updated successfully",
  });
};

const deleteRepair = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }

  const repair = await Repair.findById(id).exec();

  if (!repair) {
    return res.status(400).json({ message: "Entry not found" });
  }

  await repair.deleteOne();

  return res.status(200).json({ message: "Entry deleted" });
};

module.exports = {
  getAllRepairs,
  newRepair,
  updateRepair,
  deleteRepair,
};
