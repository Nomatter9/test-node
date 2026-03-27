const db = require('../config/db');
const os = require('os');
const process = require('process');
const CommentReaction  = require('../models/Reaction');
const {Op} = require('sequelize')


class CommentReactionController {


  //  Create reaction
  async react(req, res) {
    try {
        const user_id = req.user.id;
      const {type} = req.body;
      console.log(req.body);
      const {commentId} = req.params

console.log({type ,commentId ,user_id});
      if (!type || !commentId || !user_id) {
        return res.status(400).json({
          success: false,
          message: "commentId and type are required",
        });
      }
//1. check if reaction exists
//2. if it exists , is it same reaction ? remove it : update it
//3. no existing reaction - create new

const [existing] = await db.query(
  "SELECT * FROM reactions WHERE comment_id = ? AND user_id = ?",
  [commentId, user_id]
)

if(existing.length > 0){
        if(existing[0].type == type){
           await db.query(
        'DELETE FROM reactions WHERE comment_id = ? AND user_id = ?',
        [commentId, user_id]
      );
        return res.status(200).json({
            success: true,
            message: "Reaction removed",
            reaction_type: null
          });
        }else{
          await db.query(
              'UPDATE reactions SET type = ? WHERE user_id = ? AND comment_id = ?',
              [type, user_id, commentId]
            );
          return res.status(200).json({
            success: true,
            message: "Reaction updated",
            reaction_type: type
          });
        
        }
}else{
        await db.query(
              'INSERT INTO reactions (comment_id,user_id,type) VALUES (?, ?,?)',
              [commentId, user_id, type]
            );
              res.status(201).json({
              success: true,
              message: "Reaction added successfully",
              type: type,
            });
}
    

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error creating comment",
      });
    }
  }

}

module.exports = new CommentReactionController();

