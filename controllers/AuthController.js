const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const config = require('../config/env');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { name, email, password, country } = req.body;
      console.log(req.body)
     
      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide name, email, and password' 
        });
      }
      
      // Check if user already exists
      const [existingUsers] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'User with this email already exists' 
        });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const [result] = await db.query(
        'INSERT INTO users (name, email, password,country,role) VALUES (?, ?, ?,?,?)',
        [name, email, hashedPassword,country,"User"]
      );
      
      // Generate JWT token
      const token = jwt.sign(
        { id: result.insertId, email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: result.insertId,
          name,
          email,
          token
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: 'Error registering user' 
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
          message: 'Please provide email and password' 
        });
      }
      
      // Check if user exists
      const [users] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      const user = users[0];
      
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
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
        message: 'Login successful',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          token
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: 'Error logging in' 
      });
    }
  }
  
  // Get current user profile
  async getProfile(req, res) {
    try {
      const [users] = await db.query(
        'SELECT id, name, email, created_at FROM users WHERE id = ?',
        [req.user.id]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      res.json({
        success: true,
        data: users[0]
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching profile' 
      });
    }
  }
}

module.exports = new AuthController();
