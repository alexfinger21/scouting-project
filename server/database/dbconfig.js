const mysql = require("mysql")

const dbConfig = {
    host     : process.env.DATABASE_HOST,
    database : process.env.DATABASE,
    user     : process.env.USER,
    password : process.env.DB_PASS,
}

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