const express = require("express");
const multer = require("multer");
const path = require("path");
const authMiddleware = require('../middleware/auth');
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

const upload = multer({ storage , limits: { fileSize: 10 * 1024 * 1024 },});

// Route: upload profile picture
router.post(
  "/",
  upload.single("profile_picture"), // <── this matches FormData key
  ProfilePictureController.uploadProfilePicture
);
// router.put(
//   "/update",
//   authMiddleware,
//   upload.single("profile_picture"),
//   ProfilePictureController.updateProfilePicture
// );

// Delete profile picture
// router.delete(
//   "/delete",
//   authMiddleware,
//   ProfilePictureController.deleteProfilePicture
// );

module.exports = router;
