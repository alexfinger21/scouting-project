const database = require("./database/database.js")
const log = true

function consoleLog(arg) {
    if (toString(arg).indexOf("frc_season_master_sm_year") != -1) {
        console.log("\nFOUND THE MASSIVE PRINT STATEMENT: ")
        console.trace()
        return
    }
    if (log) {
        console.log(arg)
    }
}

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


module.exports = { checkAdmin: checkAdmin, consoleLog: consoleLog }