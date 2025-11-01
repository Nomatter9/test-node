const express = require("express");
const multer = require("multer");
const path = require("path");
const ProfilePictureController = require("../controllers/ProfilePictureController");

const router = express.Router();

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Route: upload profile picture
router.post(
  "/",
  upload.single("profile_picture"), // <── this matches FormData key
  ProfilePictureController.uploadProfilePicture
);

module.exports = router;
