const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const CommentController = require('../controllers/CommentController');
const authMiddleware = require('../middleware/auth');
const multer = require("multer")
const path = require("path");


router.use(authMiddleware)
// Public routes - anyone can view products
router.get('/',  PostController.index);

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "posts/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Route: upload profile picture
router.post("/", authMiddleware, upload.single("file"),  PostController.store);
router.get('/:id', PostController.getPostById);// get a single post
router.get('/:postId/comments', PostController.show);
router.post("/:postId/comments", CommentController.store);
router.put("/:postId/comments/:id", CommentController.update);
router.delete("/:postId/comments/:id", CommentController.destroy);


// Protected routes - only authenticated users can create/update/delete
// router.put('/:id', authMiddleware, PostController.update);
router.put('/:id',  upload.single("file"), authMiddleware, PostController.update);
router.delete('/:id', authMiddleware, PostController.destroy);

module.exports = router;
