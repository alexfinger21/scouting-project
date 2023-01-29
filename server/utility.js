const { request } = require("express");
const database = require("./database/database.js")

function checkAdmin(username) {
    return new Promise((resolve) => {
        database.query("SELECT um.um_admin_f FROM user_master um WHERE um.um_id = '" + username + "';", function (error, results) {
            if (error)
                throw error;

            console.log(results[0])
            if (results[0] == true) {
                resolve(true)
            }
        })
        resolve(false)
    })
}

module.exports = {checkAdmin}