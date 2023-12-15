const express = require("express")
const router = express.Router()
const crypto = require("crypto")
require('dotenv').config()
const database = require("../database/database.js")
const { consoleLog } = require("../utility")
const SQL = require('sql-template-strings')
//SQL

async function checkUser(body) {
    const [err, dbRes] = await database.query(SQL`SELECT * FROM user_master um WHERE um.um_id = ${body.username} AND team_master_tm_number = ${body.team_number};`)
    if (err)
        throw error;

    //consoleLog("RESULT: " + result)
    if (dbRes.length == 1) {
        const result = dbRes[0]

        if (result.um_password == body.password) {
            
            return true
        }

    }

    return false;
}



//connection.end();
router.get("/", function(req, res) {
    if (!req.cookies["user_id"]) {//if user hasn't logged in before
        const login_data = req.query.error ? req.query.error : "invisible"
        
        consoleLog(login_data)
        
        res.render("login", {error: login_data})
    } else { //if user has logged in before
        res.redirect("/")
    }
})

router.post("/", async function(req, res) {
    //TO DO - SQL QUERY TO RETRIEVE THE USER
    

    const body = req.body
    consoleLog(body)

    const date = new Date()
    consoleLog(date)

    const success = await checkUser(body)
    
    
    if (success) { //successful login
        
        consoleLog("success for " + body.username)    
        //const sessionId = decodeURI(crypto.randomBytes(32).toString())
        let sessionId = ""
        
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

        for (let i = 0; i<32; i++) {
            sessionId += characters.charAt(Math.floor(Math.random() * characters.length))
        }

        consoleLog(sessionId)

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

        const [err, dbRes] = await database.query(SQL`UPDATE 
        teamsixn_scouting_dev.user_master
    SET 
        um_session_id = "${sessionId}",
        um_timeout_ts = timestampadd(DAY, 2, current_timestamp())

    WHERE 
        team_master_tm_number = ${body.team_number} and 
        um_id = "${body.username}";`)

        return res.status(200).send({result: 'redirect', url:'/app'})
    }
     //wrong info
    return res.status(200).send({result: 'redirect', url:'/login?error=visible'})
})

module.exports = router