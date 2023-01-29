const user = require("../user")
const express = require("express")
const router = express.Router()
const crypto = require("crypto")
require('dotenv').config()
const database = require("../database/database.js")

//SQL

function checkUser(body) {
    return new Promise(resolve => {
        database.query("SELECT * FROM user_master um WHERE um.um_id = '" + body.username + "' AND team_master_tm_number = " + body.team_number + ";", function (error, results) {
            if (error)
                throw error;

            console.log("RESULT: " + result)
            if (results.length == 1) {
                const result = results[0]

                if (result.um_password == body.password) {
                    
                    resolve(true)

                    return
                }

                if (result.um_admin_f == true)
                {
                    user.admin = true
                }
                else
                {
                    user.admin = false
                }
            }

            resolve(false)
        })
    })
}



//connection.end();
router.get("/", function(req, res) {
    if (!req.cookies["user_id"]) {//if user hasn't logged in before
        const login_data = req.query.error ? req.query.error : "invisible"
        
        console.log(login_data)
        
        res.render("login", {user: user, error: login_data})
    } else { //if user has logged in before
        res.redirect("/")
    }
})

router.post("/", async function(req, res) {
    //TO DO - SQL QUERY TO RETRIEVE THE USER
    

    const body = req.body
    console.log(body)

    const date = new Date()
    console.log(date)

    let success = await checkUser(body)
    
    if (success) { //successful login

        console.log("success for " + body.username)

        const sessionId = crypto.randomBytes(32).toString()

        res.cookie("user_id", sessionId, {
            maxAge: 24 * 60 * 60 * 1000,
            // expires works the same as the maxAge
            httpOnly: true,
        })

        res.cookie("username", body.username, {
            maxAge: 24 * 60 * 60 * 1000,
            // expires works the same as the maxAge
            httpOnly: true,
        })

        database.query(`UPDATE 
        teamsixn_scouting_dev.user_master
    SET 
        um_session_id = "`+ sessionId + `",
        um_timeout_ts = timestampadd(DAY, 2, current_timestamp())

    WHERE 
        team_master_tm_number = ` + body.team_number +` and 
        um_id = "` + body.username + `";`, (err, results) => {
            console.log(results)
        })

        return res.status(200).send({result: 'redirect', url:'/app'})
    }
     //wrong info
    return res.status(200).send({result: 'redirect', url:'/login?error=visible'})
})

module.exports = router