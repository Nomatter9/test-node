const jwt = require('jsonwebtoken');
const config = require('../config/env');

const authMiddleware = (req, res, next) => {
  try {
     next();
    // Get token from header
    // const token = req.header('Authorization')?.replace('Bearer ', '');

    // if (!token) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'No token provided. Authorization denied.'
    //   });
    // }

    // // Verify token
    // const decoded = jwt.verify(token, config.jwt.secret);

    // // Add user info to request
    // req.user = decoded;
    // next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Authorization denied.'
    });
  }
};

module.exports = authMiddleware;
