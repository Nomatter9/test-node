const db = require("../config/db");
const fs = require("fs");
const path = require("path");

class ProfilePictureController {
  async uploadProfilePicture(req, res) {
    try {
      if (!req.file && !req.body.user_id) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded, please check if file is selected"
        });
      }
console.log(req.body)
      const filePath = `/uploads/${req.file.filename}`;
      const userId = req.body.user_id || 1; // use actual user ID from auth
      // Get existing profile picture
      const [rows] = await db.query(
        "SELECT profile_picture FROM users WHERE id = ?",
        [userId]
      );

      // Update DB
      await db.query("UPDATE users SET profile_picture = ? WHERE id = ?", [
        filePath,
        userId,
      ]);

      // Delete old picture if exists
      if (rows.length > 0 && rows[0].profile_picture) {
        const oldPath = `.${rows[0].profile_picture}`;
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      res.json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: {
          profile_picture: filePath,
          url: `${req.protocol}://${req.get("host")}${filePath}`,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error uploading profile picture",
      });
    }
  }
}

module.exports = new ProfilePictureController();
