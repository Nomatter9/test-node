const db = require('../config/db');

class CommentController {

  // Get all comments for a single post
  async index(req, res) {
    try {

      const { postId } = req.params;

      const [rows] = await db.query(
        "SELECT * FROM comments INNER JOIN users ON comments.user_id = users.id WHERE post_id = ?",
        [postId]
      );

      res.json({ success: true, data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error fetching comments",
      });
    }
  }

  //  Create a new comment
  async store(req, res) {
    try {
        const user_id = req.user.id;
      const { comment_body, post_id} = req.body;

      if (!comment_body || !post_id || !user_id) {
        return res.status(400).json({
          success: false,
          message: "comment_body and post_id are required",
        });
      }

      const [result] = await db.query(
        "INSERT INTO comments (comment_body, post_id, user_id) VALUES (?, ?, ?)",
        [comment_body, post_id, user_id]
      );

      res.status(201).json({
        success: true,
        message: "Comment created successfully",
        comment_id: result.insertId,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error creating comment",
      });
    }
  }

  // Update a comment
  async update(req, res) {
    try {
      const { id } = req.params;
      const { comment_body } = req.body;
       const user_id = req.user.id; 
       const user_role = req.user.role

     
      if (!comment_body) {
        return res.status(400).json({
          success: false,
          message: "Updated comment text is required",
        });
      }

        if(user_role === "admin"){
         await db.query(
        "UPDATE comments SET comment_body = ? WHERE id = ?",
        [comment_body]
      );
      return res.json({
        success: true,
        message: "Comment updated by admin",
      });
       }
      const [result] = await db.query(
        "UPDATE comments SET comment_body = ? WHERE id = ? AND user_id = ?",
        [comment_body, id, user_id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      res.json({
        success: true,
        message: "Comment updated successfully",
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error updating comment",
      });
    }
  }

  // Delete a comment
  async destroy(req, res) {
    try {
      const { id } = req.params;
     const user_id = req.user.id;
     const user_role = req.user.role

       if(user_role === "admin"){
        await db("DELETE FROM comments WHERE id = ?", [comment_id])
        return res.json({
          success: true,
          message: "Comment successfully deleted by Admin",
        });
      }
      const [result] = await db.query(
        "DELETE FROM comments WHERE id = ? AND user_id = ?",
        [id, user_id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      res.json({
        success: true,
        message: "Comment deleted successfully",
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error deleting comment",
      });
    }
  }
}

module.exports = new CommentController();

