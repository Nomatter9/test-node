const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = sequelize.define("User",{
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true  
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate:{
            isEmail: true
        }
    },
    role:{
        type: DataTypes.STRING,
        defaultValue: "User"
    },
    profile_Picture:{
        type: DataTypes.STRING,
        allowNull: true
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
},

    {
        tableName: "users",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        defaultScope: {
            attributes: {
                exclude: ["password"]
            }
        },
        scopes: {
            withPassword: {
               attributes: {
                 include: ["password"]
                }
            }
        }
    }
);
module.exports = User