const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");
const getUploadFolder = require("../utils/folderHelper");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const folder = getUploadFolder(req);
    return {
      folder: folder,
      allowed_formats: ["jpeg", "png", "jpg"],
      public_id: file.originalname.split(".")[0],
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
