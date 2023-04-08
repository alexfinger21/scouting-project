const database = require("./database/database.js")
const log = true

function checkAdmin(req) {
    const username = req.cookies["username"]
    return new Promise((resolve) => {
        database.query("SELECT um.um_admin_f FROM user_master um WHERE um.um_id = '" + username + "';", function (error, results) {
            if (error)
                throw error;

            consoleLog(results[0].um_admin_f == true)
            if (results[0].um_admin_f == 1) { //is admin
                resolve(true)
            }
            
            resolve(false)
        })
    })
}

function consoleLog(arg) {
    if (log) {
        console.log(arg)
    }
}

module.exports = {checkAdmin: checkAdmin, consoleLog: consoleLog}