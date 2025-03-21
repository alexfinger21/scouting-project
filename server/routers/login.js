const express = require("express")
const router = express.Router()
const crypto = require("crypto")
require('dotenv').config()
const database = require("../database/database.js")
const { consoleLog, logoutMS } = require("../utility")
//SQL 
const SQL = require('sql-template-strings')

async function checkUser(body) {
    const [err, dbRes] = await database.query(SQL`SELECT * FROM user_master um WHERE um.um_id = ${body.username} AND team_master_tm_number = ${body.team_number};`)
    if (err)
        throw err;

    //consoleLog("RESULT: " + result)
    if (dbRes.length == 1) {
        const result = dbRes[0]

        if (result.um_password == body.password) {

            return true
        }

    }

    return false;
}

function strongRandomString(chars, maxLen) {
    const randomBytes = crypto.randomBytes(chars.length)
    let res = ""

    for (let i = 0; i<maxLen; ++i) {
        res += chars[randomBytes[i] % chars.length]
    }

    return res
}

//connection.end();
router.get("/", function (req, res) {
    if (!req.cookies["user_id"]) {//if user hasn't logged in before
        const login_data = req.query.error ? req.query.error : "invisible"

        consoleLog(login_data)

        res.render("login", { error: login_data })
    } else { //if user has logged in before
        res.redirect("/")
    }
})

router.post("/", async function (req, res) {
    //TO DO - SQL QUERY TO RETRIEVE THE USER

    const body = req.body
    consoleLog(body)

    const date = new Date()
    consoleLog(date)

    const success = await checkUser(body)

    if (success) { //successful login

        let [err, sessionResult] = await database.query(SQL`SELECT * from teamsixn_scouting_dev.user_master WHERE team_master_tm_number = ${body.team_number} and 
        um_id = ${body.username};`)


        sessionResult = sessionResult[0].um_session_id ? (sessionResult[0].um_session_id.indexOf(',') != -1 ? sessionResult[0].um_session_id.split(',') : [sessionResult[0].um_session_id]) : []

        consoleLog("success for " + body.username)
        //const sessionId = decodeURI(crypto.randomBytes(32).toString())
        
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~./'

        const sessionId = strongRandomString(characters, 32)

        sessionResult.splice(0, 0, sessionId)

        sessionResult.length = 3

        consoleLog(sessionResult)

        res.cookie("user_id", sessionId, {
            sameSite: "lax",
            maxAge: logoutMS,
            // expires works the same as the maxAge
            httpOnly: true,
        })

        res.cookie("username", body.username, {
            sameSite: "lax",
            maxAge: logoutMS,
            // expires works the same as the maxAge
            httpOnly: true,
        })

        const result = await database.query(SQL`UPDATE 
        teamsixn_scouting_dev.user_master
    SET 
        um_session_id = ${sessionResult.join(",")},
        um_timeout_ts = timestampadd(DAY, 2, current_timestamp())

    WHERE 
        team_master_tm_number = ${body.team_number} and 
        um_id = ${body.username};`)

        return res.status(200).send({ result: 'redirect', url: '/app' })
    }
    //wrong info
    return res.status(200).send({ result: 'redirect', url: '/login?error=visible' })
})

module.exports = router
