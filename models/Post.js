const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Post = sequelize.define("Post",{
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true  
    },
   title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    user_id:{
        type: DataTypes.INTEGER,
         allowNull: false
    },
   body:{
        type: DataTypes.TEXT,
        allowNull: false
    }, 
    image:{
        type: DataTypes.STRING,
        allowNull: true
    },
 
},

    {
        tableName: "posts",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);
module.exports = Post