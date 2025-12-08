const db = require('../config/db');
const bcrypt = require('bcryptjs');


class PostController {
  // Get all Users
  async index(req, res) {

    const { query, limit } = req.query || 10;
     const validLimit = [5, 10,15, 20]
    //   if(!validLimit.includes(Number(limit))){
    //     return res.status(500).json({
    //   success: false,
    //   message: "Invalid limit"
    // });
    //   }
  try {
    let sql = "SELECT * FROM posts";
    let params = [];

    if (query) {
  sql += " WHERE title LIKE ? OR body LIKE ? OR user_id LIKE ?";
  params.push(`%${query}%`, `%${query}%`, `%${query}%`);
}


    sql += " ORDER BY id DESC";
    if (limit) {
      sql += " LIMIT ?";
    params.push(Number(limit));  
    }
// sql += " OFFSET 5 ";
    const [rows] = await db.query(sql, params);

    res.json({ success: true, data: rows });
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
      
      const [rows] = await db.query(
        'SELECT * FROM posts WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
      
      res.json({
        success: true,
        data: rows[0]
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

      const [result] = await db.query('DELETE FROM posts WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
           success: false,
           message: 'Post not found' 
          });
      }

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
      const {title, body} = req.body;
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
      const [result] = await db.query(
        'INSERT INTO posts (title, body, user_id, image) VALUES (?, ?, ?, ? )',
        [title, body, user_id, filePath]
      );

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        postId: result.insertId,
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
            const [comments] = await db.query(`
          SELECT comments.*, users.name, users.profile_picture
          FROM comments
          INNER JOIN users ON comments.user_id = users.id
          WHERE post_id = ?
          ORDER BY comments.created_at DESC
        `, [req.params.postId]);

        const ids = comments.map(c => c.id);
        const [reactions] = await db.query(`
          SELECT * FROM comment_reactions 
          WHERE comment_id IN (?)
        `, [ids]);

        const result = comments.map(c => ({
          ...c,
          reactions: reactions.filter(r => r.comment_id === c.id)
        }));

        
        // if (rows.length === 0) {
        //   return res.status(200).json({ 
        //     success:true, 
        //     message: 'Product not found' 
        //   });
        // }
        
        res.json({ success: true, data:result});
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
   
      const { title, body} = req.body;

      if (!title|| !body) {
        return res.status(400).json({
          success: false,
          message: 'Title and body are required',
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

      const [post_query] = await db.query(
        'SELECT id,user_id,image FROM posts WHERE id = ?',
        [id]
      );
      if(post_query.length == 0){
        return res.status(404).json({
      success: false,
      message: "Post not found ",
    });
      } 
      if(req.user.id != post_query[0].user_id && req.user.role != "Superadmin"){
        return res.status(403).json({
      success: false,
      message: "You are not allowed to update this post ",
    });
      }
      
      if(!req.file && post_query[0].image != null){
        filePath = post_query[0].image
      }
       const [result] = await db.query(
        'UPDATE posts SET title= ?, body = ?, image = ? WHERE id = ?',
        [title, body, filePath, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
        });
      }

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


