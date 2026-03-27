const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Comment = sequelize.define("Comment",{
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true  
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
   post_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: "Post",
            key: "id"
        }
    },
    comment_body:{
        type: DataTypes.STRING,
        defaultValue: "User"
    }
},

    {
        tableName: "comments",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);
module.exports = Comment