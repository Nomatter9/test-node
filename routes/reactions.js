const express = require('express');
const router = express.Router();
const CommentReactionController = require('../controllers/CommentReactionController');
const authMiddleware = require('../middleware/auth');



router.use(authMiddleware)


router.post('/:commentId/react', CommentReactionController.react);


module.exports = router;
