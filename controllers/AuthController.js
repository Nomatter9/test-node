const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const config = require("../config/env");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/user");
const PasswordResetToken = require("../models/PasswordResetToken");
const { where } = require("sequelize");

class AuthController {
 // Register new user
async register(req, res) {
  try {
    const { name, email, password, country } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where:{email}
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
  
const user = await User.create({
  name,
  email,
  password:hashedPassword,
  country,
  role: "User",
})
  
    // Return success response
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        id: user.Id,
        name,
        email,
        token,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error registering the user",
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
     
      const user = await User.scope("withPassword").findOne({
        where:{email}
      })

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

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
        { id: user.id, email: user.email, role: user.role },
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
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Please provide email",
        });
      }

      // Check if email exists and get user name
   
      const existingUser = await User.findOne({
        where: {email}
      })
      if (!existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email does not exist",
        });
      }

      const userName = existingUser.name; 
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // Create token
      await PasswordResetToken.create({
        email,
        token,
       expires_at: expiresAt
      })
      const resetPasswordLink = `${process.env.RESET_PASSWORD_LINK}?token=${token}`;

      // Setup transporter
      var transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });

      // Password reset email
      const mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: email,
        subject: `🔐 Password Reset Request - ${process.env.MAIL_FROM_NAME}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  
  <table width="100%" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        
        <table width="600" style="background-color: #ffffff; border-radius: 10px; padding: 40px;">
          
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="color: #4F46E5; font-size: 28px; margin: 0;">
                🔐 Password Reset Request
              </h1>
            </td>
          </tr>
          
          <tr>
            <td>
              <p style="font-size: 18px; color: #333333; margin: 0 0 20px;">
                Hi ${userName}! 👋
              </p>
              
              <p style="font-size: 16px; color: #666666; line-height: 1.6; margin: 0 0 20px;">
                We received a request to reset your password for your ${process.env.MAIL_FROM_NAME} account.
              </p>
              
              <p style="font-size: 16px; color: #666666; line-height: 1.6; margin: 0 0 30px;">
                Click the button below to reset your password:
              </p>
            </td>
          </tr>
          
          <tr>
            <td align="center" style="padding: 20px 0;">
              <a href="${resetPasswordLink}" style="display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                Reset Password
              </a>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <p style="font-size: 14px; color: #856404; margin: 0; line-height: 1.5;">
                ⚠️ <strong>Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
              </p>
            </td>
          </tr>
          
          <tr><td style="height: 30px;"></td></tr>
          
          <tr>
            <td>
              <p style="font-size: 14px; color: #999999; line-height: 1.5; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetPasswordLink}" style="color: #4F46E5; word-break: break-all;">${resetPasswordLink}</a>
              </p>
            </td>
          </tr>
          
          <tr><td style="height: 30px;"></td></tr>
          
          <tr>
            <td>
              <p style="font-size: 15px; color: #666666; line-height: 1.5; margin: 0;">
                Best regards,<br>
                <strong>The ${process.env.MAIL_FROM_NAME} Team</strong>
              </p>
            </td>
          </tr>
          
        </table>
        
        <table width="600" style="padding-top: 20px;">
          <tr>
            <td align="center">
              <p style="font-size: 12px; color: #999999; margin: 0;">
                © 2024 ${process.env.MAIL_FROM_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
        `,
      };

      // Send email
await transporter.sendMail(mailOptions);

      return res.status(200).json({
        success: true,
        message: "Reset password email sent successfully",
      });
    } catch (error) {
      console.error("Forgot Password Error:", error);
      res.status(500).json({
        success: false,
        message: "Error sending password reset email",
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { password, confirmPassword, token } = req.body;

      // Validate input
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

      // Check if token exists
   
      const existingToken = await PasswordResetToken.findOne({
        where:{token}
      })
      if (!existingToken) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      const tokenData = existingToken;

      // Check if token is expired
const expiresAt = new Date(tokenData.expires_at);
if (expiresAt < new Date()) {
 const tokenToDelete = await PasswordResetToken.findOne({
  where:{token}
})
await tokenToDelete.destroy()
  return res.status(400).json({
    success: false,
    message: "Token has expired. Please request a new password reset link.",
  });
}

      // Get user by email
   
const user = await User.scope("withPassword").findOne({
  where:{email : tokenData.email}
})
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password
   await user.update({
          email :  tokenData.email,
          password: hashedPassword
        })
      // Delete token after successful reset
    await existingToken.destroy()

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
  const user = await User.findByPk(req.user.id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: user,
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