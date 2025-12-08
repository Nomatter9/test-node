const db = require('../config/db');
const bcrypt = require('bcryptjs');
const os = require('os');
const process = require('process');
const User = require('../models/user');
const {Op} = require('sequelize')


class UserController {
  // Get all Users
  async index(req, res) {
// console.log(os.platform());
// console.log((os.totalmem()/(1024 * 1024 *1024)).toFixed(2));
// console.log(os.freemem());
// console.log(os.userInfo());
// console.log(process.pid);
// console.log(process.version);

    const { query, limit } = req.query;
     const validLimit = [5, 10,15, 20]
      if(!validLimit.includes(Number(limit))){
        return res.status(500).json({
      success: false,
      message: "Invalid limit"
    });
      }
  try {
    const where = {}
      if (query) {
        where[Op.or] = [
          {name: {[Op.like]: `%${query}%` }},
          {email: {[Op.like]: `%${query}%` }},
          {role: {[Op.like]: `%${query}%` }}
        ]
}
  const users = await User.findAll({
        where,
        limit: parseInt(limit)
  })

    res.json({ success: true, data: users});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching users"
    });
  }
}


  //delete
   async destroy(req, res) {
    try {
   const { id } = req.params;
    const user = await User.findByPk(id)
     if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    if (user && user.role?.toLowerCase() === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete superadmin account',
      });
    }
    await user.destroy()
     
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

      const existingUser = await User.findOne({
        where: {email}
      })
      if(existingUser){
          res.status(201).json({
        success: false,
        message: 'Email already taken',
      });
      }
      // Example: Insert user (hash password in real-world)
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || "User",
        country: country || null
      })


      res.status(201).json({
        success: true,
        message: 'User created successfully',
        userId: user.id,
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
     
     const [affectedRows] = await User.update({
      name,
      email,
      role,
      country
     },
     {where:{id}}
    )
      if (affectedRows === 0) {
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


