const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const config = require("../config/env");
const nodemailer = require("nodemailer");
const crypto = require("crypto")


class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { name, email, password, country } = req.body;
      console.log(req.body);

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide name, email, and password",
        });
      }

      // Check if user already exists
      const [existingUsers] = await db.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const [result] = await db.query(
        "INSERT INTO users (name, email, password,country,role) VALUES (?, ?, ?,?,?)",
        [name, email, hashedPassword, country, "User"]
      );

      // Generate JWT token
      const token= jwt.sign(
        { id: result.insertId, email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Looking to send emails in production? Check out our Email API/SMTP product!
      var transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port:process.env.MAIL_PORT,
        auth: {
          user:process.env.MAIL_USERNAME,
          pass:process.env.MAIL_PASSWORD,
        }
      });
      const mailOptions = {
        from: process.env.EMAIL_FROM_ADDRESS || "noreply@myapp.com",
        to: email,
        subject: `🎉 Welcome to ${process.env.MAIL_FROM_NAME}!`,
        html: `<h2>Hi ${name},</h2><p>Welcome to ${process.env.MAIL_FROM_NAME}! We're excited to have you onboard 🚀.</p>`,
      };
     transporter.sendMail(mailOptions, (err, info) => {
      if (err) return console.error("Email error:", err);
      console.log("Email sent:", info.response);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
    });
  }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password",
        });
      }

      // Check if user exists
      const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const user = users[0];

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.json({
        success: true,
        message: "Login successful",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          token,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error logging in",
      });
    }
  }


   async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      // Validate input
      if ( !email) {
        return res.status(400).json({
          success: false,
          message: "Please provide  email",
        });
      }

      // Check if   email exists
      const [existingUsers] = await db.query(
        "SELECT id, name FROM users WHERE email = ?",
        [email]
      );

      if (existingUsers.length <= 0) {
        return res.status(400).json({
          success: false,
          message: "User with this email does not exists",
        });
      }
const token = crypto.randomUUID();
const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 


      // Create token
      const [result] = await db.query(
        "INSERT INTO password_reset_tokens (email, token,expires_at) VALUES (?, ?, ?)",
        [ email, token, expiresAt]
      );
const resetPasswordLink = `${process.env.RESET_PASSWORD_LINK}?token=${token}`
     

      // Looking to send emails in production? Check out our Email API/SMTP product!
      var transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port:process.env.MAIL_PORT,
        auth: {
          user:process.env.MAIL_USERNAME,
          pass:process.env.MAIL_PASSWORD,
        }
      });
      const mailOptions = {
        from: process.env.EMAIL_FROM_ADDRESS || "noreply@myapp.com",
        to: email,
        subject: `🎉 Reset Password!`,
        html: `<h2>Hi ${existingUsers[0].name},</h2><p>Please click this link to reset your password.<br><br><a href=${resetPasswordLink}> ${resetPasswordLink}</a></p>`,
      };
     transporter.sendMail(mailOptions, (err, info) => {
      if (err) return console.error("Email error:", err);
      console.log("Email sent:", info.response);
       return res.status(200).json({
      success: true,
      message: "Reset password email sent successfully",
  });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
    });
  }
  }


   async resetPassword(req, res) {
  try {
    const { password, confirmPassword, token } = req.body;

    //  Validate input
    if (!password || !confirmPassword || !token) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    //  Check if token exists
    const [existingTokens] = await db.query(
      "SELECT * FROM password_reset_tokens WHERE token = ?",
      [token]
    );

    if (existingTokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const tokenData = existingTokens[0];

    //  Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      await db.query("DELETE FROM password_reset_tokens WHERE token = ?", [token]);

      return res.status(400).json({
        success: false,
        message: "Token has expired. Please request a new password reset link.",
      });
    }

    //  Get user by email (and make sure they still exist)
    const [user] = await db.query("SELECT * FROM users WHERE email = ?", [
      tokenData.email,
    ]);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //  Update password
    await db.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      tokenData.email,
    ]);

    // Delete token after successful reset
    await db.query("DELETE FROM password_reset_tokens WHERE token = ?", [token]);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
}

  // Get current user profile
  async getProfile(req, res) {
    try {
      const [users] = await db.query(
        "SELECT id, name, email, created_at FROM users WHERE id = ?",
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: users[0],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error fetching profile",
      });
    }
  }
}

module.exports = new AuthController();
