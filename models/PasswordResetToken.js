const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const PasswordResetToken = sequelize.define("PasswordResetToken",{
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true  
    },
     email:{
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            isEmail: true
        }
    },
   token:{
        type: DataTypes.STRING,
         allowNull: false,
    },
   expires_at:{
        type: DataTypes.DATE,
    }
},

    {
        tableName: "password_reset_tokens",
        timestamps: false,
    }
);
module.exports = PasswordResetToken