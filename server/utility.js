const database = require("../database/database.js")

function checkAdmin() {
    return new Promise((resolve) => {
        database.query("SELECT * FROM user_master um WHERE um.um_id = '" + body.username + "' AND team_master_tm_number = " + body.team_number + ";", function (error, results) {
            if (error)
                throw error;

            if (result.um_admin_f == true) {
                resolve(true)
            }
        })
        resolve(false)
    })
}

module.exports = {checkAdmin}