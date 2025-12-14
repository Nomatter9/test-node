const Post = require("./Post")
const Comment = require("./Comment")
const sequelize = require("../config/sequelize")
const User = require("./user")
const Reaction = require("./Reaction")

Post.hasMany(Comment,{
    foreignKey: "post_id",
    as: "comments",
    onDelete: "CASCADE"  
})

Comment.belongsTo(Post,{
  foreignKey: "post_id" ,
   as: "post"
})

User.hasMany(Comment,{
    foreignKey: "user_id",
    as: "comments",
    onDelete: "CASCADE"  
})

Comment.belongsTo(User,{
  foreignKey: "user_id" ,
   as: "user"
})
Comment.hasMany(Reaction,{
    foreignKey: "comment_id",
    as: "reactions",
})
Reaction.belongsTo(Comment,{
  foreignKey: "comment_id" ,
   as: "comment"
})
User.hasMany(Reaction,{
    foreignKey: "user_id",
    as: "reactions",
})
Reaction.belongsTo(User,{
  foreignKey: "user_id" ,
   as: "user"
})

module.exports = {
    sequelize,
    Post,
    Comment
}