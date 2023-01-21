const user = require("../user")
const express = require("express")
const router = express.Router()
const crypto = require("crypto")
const database = require("../database/database.js")
const { query } = require("express")
require('dotenv').config()

//SQL

function checkUser(body) {
    return new Promise(resolve => {
        database.query("SELECT * FROM user_master um WHERE um.um_id = '" + body.username + "' AND team_master_tm_number = " + "695" + " ;", function (error, results) {
            if (error)
                throw error;
        
            if (results.length == 1) {
                const result = results[0]

                if (result.um_password == body.password) {
                    
                    resolve(true)

                    return
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

    let success = await checkUser(body)
    
    if (success) { //successful login

        console.log("success for " + body.username)

        const sessionId = crypto.randomBytes(32).toString

        res.cookie("user_id", crypto.randomBytes(32).toString, {
            maxAge: 24 * 60 * 60 * 1000,
            // expires works the same as the maxAge
            httpOnly: true,
        })

        database.query(`UPDATE 
        teamsixn_scouting_dev.user_master
    SET 
        um_session_id = '`+ sessionId + `'
    WHERE 
        team_master_tm_number = 695 and 
        um_id = 'alex';`)

        return res.status(200).send({result: 'redirect', url:'/app'})
    }
     //wrong info
    return res.status(200).send({result: 'redirect', url:'/login?error=visible'})
})

module.exports = router