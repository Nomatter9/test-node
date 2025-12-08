const { Sequelize } = require("sequelize")
require("dotenv").config()

//create sequalize instance
// DB_HOST=localhost
// DB_USER=root
// DB_PASSWORD=
// DB_NAME=products_db
// PORT=3000

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
       host: process.env.DB_HOST,
       dialect: "mysql" ,
       logging: false,
       pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
       }
    }
)
sequelize.authenticate()
.then(()=> console.log("Sequelize connected successfully"))
.catch(err => console.log( "Sequelize connection error", err))

module.exports = sequelize;