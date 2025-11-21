import mysql from "mysql2"
import dotenv from "dotenv"

dotenv.config()

function mysqlCast(field, next) {
    switch (field.type) {
        case "NEWDECIMAL":
        case "DECIMAL":
        case "LONGLONG":
            const str = field.string()
            return str != null ? Number(str) : null
    }
    return next()
}

const dbConfig = {
    host             : process.env.DATABASE_HOST,
    database         : process.env.DATABASE,
    user             : process.env.DB_USER,
    password         : process.env.DB_PASS,
    connectTimeout   : 1 * 60 * 1000,
    bigNumberStrings : false,
    typeCast         : mysqlCast
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

export default pool
