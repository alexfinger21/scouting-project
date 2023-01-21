const pool = require('./dbconfig')                  

function executeQuery(sql, callback) {
    pool.query(sql, function (error, results, fields) {
        if (error) {
            return callback(error, null)
        }else{
            return callback(null, results)
        } 
    })
}

module.exports = {
    query: executeQuery
}