const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Reaction = sequelize.define("Reaction",{
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true  
    },
    comment_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
  user_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type:{
        type: DataTypes.STRING,
        allowNull: false
    }
},

    {
        tableName: "reactions",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = Reaction