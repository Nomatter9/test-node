const db = require('../config/db');
const bcrypt = require('bcryptjs');
const Post= require('../models/Post');
const {Op} = require('sequelize')
const process = require('process');
const os = require('os');
const Comment = require('../models/Comment');
const User = require('../models/user');
const Reaction = require('../models/Reaction');




class PostController {
  // Get all posts
  async index(req, res) {

    const { query, limit } = req.query || 10;
     const validLimit = [5, 10,15, 20,40,50]
      if(!validLimit.includes(Number(limit))){
        return res.status(500).json({
      success: false,
      message: "Invalid limit"
    });
      }
  try {
    let params = [];

    const where = {}
    if (query) {
      where[Op.or] = [
        {title : {[Op.like]: `%${query}%`}},
        {body: {[Op.like]: `%${query}%`}},
        {user_id: {[Op.like]: `%${query}%`}}
      ]
}

    const posts = await Post.findAll({
       where,
       limit: parseInt(limit)
    })

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching posts"
    });
  }
}
//get a single post
 async getPostById(req, res) {
    try {
      const { id } = req.params;
      
      const posts = await Post.findByPk(id)
      
      if (posts.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
      
      res.json({
        success: true,
        data: posts[0]
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error fetching post'
      });
    }
  }

  //delete
   async destroy(req, res) {
    try {
      const { id } = req.params;

      const post = await Post.findByPk(id)

      if (!post) {
        return res.status(404).json({
           success: false,
           message: 'Post not found' 
          });
          
      }
  if(req.user.id != post.user_id && req.user.role != "Superadmin"){
        return res.status(403).json({
      success: false,
      message: "You are not allowed to delete this post ",
    });
      }
   await post.destroy()
      res.json({ 
        success: true, 
        message: 'Post deleted successfully'
       });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting post' 
      });
    }
  }

  // CREATE: Add new post
  async store(req, res) {
    try {
      const {title, body, image} = req.body;
    const user_id = req.user.id
    console.log(req.user);
      if (!title || !body|| !user_id) {
        return res.status(400).json({
          success: false,
          message: 'Title, Body, User_id are required',
        });
      }
        

      //TODO: validate file
      let filePath = null
          if (req.file) {
        const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (!validTypes.includes(req.file.mimetype)) {
         return res.status(400).json({
          success: false,
        message: "Only JPEG, PNG, JPG, WEBP images are allowed",
    });
  }

  // 10MB limit
  const maxSize = 10 * 1024 * 1024;
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: "Image must be less than 10MB",
    });
  }
  filePath = `/posts/${req.file.filename}`;           
  }
      // Example: Insert post 
await Post.create({
        title,
        body,
        user_id,
        image: filePath
      });

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        postId: req.params,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error creating Post',
      });
    }
  }
   async show(req, res) {
      try {
   const {postId} = req.params     
   const post = await Post.findByPk(postId,{
    include:[{
      model: Comment,
      as: "comments",
      required: false,
      include:[{
        model: User,
        as: "user"
      },
      { model: Reaction,
        as: "reactions",
        include:[{
          model: User,
          as: "user"
        }]
      }
    ]
    }]
   })

        res.status(200).json({ success: true, data:post});
      } catch (error) {
        console.error(error);
        res.status(500).json({ 
          success: false, 
          message: 'Error fetching comments' 
        });
      }
    }

  // UPDATE: Modify existing user
  async update(req, res) {
    try {
      const { id } = req.params;
   
      const { title, body,image} = req.body;

      if (!title|| !body) {
        return res.status(400).json({
          success: false,
          message: 'Title and body are required',
        });
      }
          const post = await Post.findByPk(id);

        if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
        });
      }
         let filePath = null
          if (req.file) {
        const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (!validTypes.includes(req.file.mimetype)) {
         return res.status(400).json({
          success: false,
        message: "Only JPEG, PNG, JPG, WEBP images are allowed",
    });
  }

  // 10MB limit
  const maxSize = 10 * 1024 * 1024;
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: "Image must be less than 10MB",
    });
  }
  filePath = `/posts/${req.file.filename}`;           
  }
      if(req.user.id != post.user_id && req.user.role != "Superadmin"){
        return res.status(403).json({
      success: false,
      message: "You are not allowed to update this post ",
    });
      }
      
      if(!req.file && post.image != null){
        filePath = post.image
      }
        await post.update({
        title,
        body,
        image: filePath
        });

    

      res.json({ 
        success: true,
         message: 'Post updated successfully' 
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error updating post',
      });
    }
  }
}

module.exports = new PostController();


