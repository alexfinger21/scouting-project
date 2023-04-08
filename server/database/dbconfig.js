const mysql = require("mysql")
require("dotenv").config()

const dbConfig = {
    host     : process.env.DATABASE_HOST,
    database : process.env.DATABASE,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
}

console.log(dbConfig)

let pool = mysql.createPool(dbConfig)
// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.')
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.')
    }
    if (err.code === 'ECONNREFUSED') {
      console.error(err)
      console.error('Database connection was refused.')
    }
  }

  if (connection){
    console.log("connection id: " + connection.threadId)
    connection.release()
    return
  }
})
module.exports = pool