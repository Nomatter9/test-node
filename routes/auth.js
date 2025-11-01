const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);



// router.post('/register', (req, res) => AuthController.register(req, res));
// router.post('/login', (req, res) => AuthController.login(req, res));

// Protected routes
router.get('/profile', authMiddleware, AuthController.getProfile);

module.exports = router;
