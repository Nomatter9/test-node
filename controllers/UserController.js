const db = require('../config/db');
const bcrypt = require('bcryptjs');


class UserController {
  // Get all Users
  async index(req, res) {
    try {
   
      const [rows] = await db.query('SELECT id,name,email,created_at,role,country FROM users ORDER BY id DESC');
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching users' 

      });
    }
  }
  //delete
   async destroy(req, res) {
    try {
      const { id } = req.params;
       const [user] = await db.query('SELECT role FROM users WHERE id = ?', [id]);
    
    if (user.length > 0 && user[0].role?.toLowerCase() === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete superadmin account',
      });
    }

      const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error deleting user' });
    }
  }

  // CREATE: Add new user
  async store(req, res) {
    try {
      const { name, email, password, role, country } = req.body;
       const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required',
        });
      }

      // Example: Insert user (hash password in real-world)
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role, country) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, role || 'user', country || null]
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        userId: result.insertId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error creating user',
      });
    }
  }

  // UPDATE: Modify existing user
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, role, country } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name and email are required',
        });
      }

      const [result] = await db.query(
        'UPDATE users SET name = ?, email = ?, role = ?, country = ? WHERE id = ?',
        [name, email, role, country, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error updating user',
      });
    }
  }
}

module.exports = new UserController();


