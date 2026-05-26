const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/authMiddleware");
const { recommendCrop, detectDisease } = require("../controllers/mlController");

// Ensure uploads directory exists for saving uploaded leaf images
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up Multer disk storage for leaf scan uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(
      null,
      `leaf-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File filter to restrict to standard web image types
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Images only! Upload a valid leaf photo (JPG, JPEG, PNG, WEBP)."));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // limit file size to 5MB
});

// Mount endpoints
// Crop Recommendation endpoint
router.post("/recommend", protect, recommendCrop);

// Leaf Disease Detection endpoint (accepts single leaf file upload)
router.post("/detect", protect, upload.single("leaf"), detectDisease);

module.exports = router;
