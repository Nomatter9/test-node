const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware)
// Public routes - anyone can view products
router.get('/', authMiddleware, UserController.index);
// router.get('/:id', UserController.show);

// Protected routes - only authenticated users can create/update/delete
router.post('/', authMiddleware, UserController.store);
router.put('/:id', authMiddleware, UserController.update);
router.delete('/:id', authMiddleware, UserController.destroy);

module.exports = router;
