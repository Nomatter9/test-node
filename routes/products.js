const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const authMiddleware = require('./auth');

// Public routes - anyone can view products
router.get('/', ProductController.index);
router.get('/:id', ProductController.show);

// Protected routes - only authenticated users can create/update/delete
router.post('/', authMiddleware, ProductController.store);
router.put('/:id', authMiddleware, ProductController.update);
router.delete('/:id', authMiddleware, ProductController.destroy);

module.exports = router;
