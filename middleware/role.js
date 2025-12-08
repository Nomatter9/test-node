const jwt = require('jsonwebtoken');
const config = require('../config/env');
const authMiddleware = require('./auth');

const roleMiddleware = (...allowedRoles) => {
  try {
return [
  authMiddleware,//first verify if user is authenticated
  (req,res,next) =>{
//check if user has required role
console.log("role:",req.user);
if(!req.user.role || !allowedRoles.includes(req.user.role)){
 return res.status(403).json({
    success:false,
    message: "Unauthorized: You do not have permission to access this route."
  })
}
    next();

  }
]
  } catch (error) {
        console.error('Role middleware error:', error);
        return res.status(500).json({
          success: false,
          message: "Server error in role middleware.",
   });
      }
    }
const superAdminOnly = roleMiddleware("Superadmin")
// const superAdminOnly = roleMiddleware("superadmin")
module.exports = {
  roleMiddleware,
  superAdminOnly
}