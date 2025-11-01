const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('./auth');

// Public routes - anyone can view products
router.get('/', UserController.index);
router.delete('/:id', UserController.destroy);
router.post('/', UserController.store);
router.put('/:id', UserController.update);
// router.get('/:id', UserController.show);

// Protected routes - only authenticated users can create/update/delete
// router.post('/', authMiddleware, UserController.store);
// router.put('/:id', authMiddleware, UserController.update);
// router.delete('/:id', authMiddleware, UserController.destroy);

module.exports = router;
