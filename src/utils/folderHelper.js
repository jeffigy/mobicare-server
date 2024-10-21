const getUploadFolder = (req) => {
  if (req.body.uploadType === "profile") {
    return `mobicare/profile/${req.body.id}`;
  } else if (req.body.uploadType === "repair") {
    return `uploads/repair/${req.body.id}`;
  }
  return "mobicare/misc";
};

module.exports = getUploadFolder;
