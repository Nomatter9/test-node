const db = require('../config/db');
const os = require('os');
const process = require('process');
const Comment = require('../models/Comment');
const {Op, where} = require('sequelize')


class CommentController {

  // Get all comments for a single post
  async index(req, res) {
    try {

      const { postId } = req.params;

      const comments = await Comment.findAll({
        where: { post_id: postId }
      } );

      res.json({ success: true, data: comments });
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

     await Comment.create({
      user_id,
      post_id,
      comment_body
      },
    );

      res.status(201).json({
        success: true,
        message: "Comment created successfully",
        comment_id: req.body,
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
       
      if (!id) {
      return res.status(400).json({
        success: false,
        message: "Comment ID is required",
      });
    }

     
      if (!comment_body) {
        return res.status(400).json({
          success: false,
          message: "Updated comment text is required",
        });
      }

      const comment = await Comment.findByPk(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }
       if(req.user.id != comment.user_id && req.user.role != "Superadmin"){
        return res.status(403).json({
      success: false,
      message: "You are not allowed to update this comment ",
    });
      }

     await comment.update({comment_body})
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


      const comment = await Comment.findByPk(id)

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

       if(req.user.id != comment.user_id && req.user.role != "Superadmin"){
        return res.status(403).json({
      success: false,
      message: "You are not allowed to update this comment ",
    });
  }
      await comment.destroy()
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

