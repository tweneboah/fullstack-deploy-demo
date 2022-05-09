const cloudinary = require("cloudinary").v2;

const { CloudinaryStorage } = require("multer-storage-cloudinary");

//configure cloudinary
cloudinary.config({
  cloud_name: "tweneboah",
  api_key: "986451386744613",
  api_secret: "GiusV0bSLrMqioANgP3H0j0dAL0",
});

//instance of cloudinary

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "web-bootcamp-app",
    allowedFormats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

module.exports = storage;
