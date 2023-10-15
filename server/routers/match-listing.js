const express = require("express")
const router = express.Router()
require('dotenv').config()
const database = require("../database/database.js")
const { checkAdmin } = require("../utility")
const socketManager = require("../sockets.js")
const { data } = require("jquery")
const { consoleLog } = require("../utility")

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

process.env.lastPlayedMatch = 1

function addZero(num) {
    return num < 10 ? "0" + String(num) : String(num)
}

router.get("/", async function (req, res) {
    consoleLog("GET request for match listing")
    consoleLog("Get collected data: " + req.query.getCollectedData)
    if ("" + req.query.getCollectedData == "true") {
        database.query(database.getCollectedData(req.query.matchNumber), (err, results) => {
            //consoleLog("COLLECTED DATA RESULTS")
            //consoleLog(results)
            res.status(200).send(JSON.stringify(results))
        })
    }
    else {
        database.query(database.getTeams(), async (err, results) => {
            //get isAdmin
            consoleLog(err)
            const isAdmin = await checkAdmin(req)
    
            //get running game
            let runningMatch = -1
            database.query(`select * from teamsixn_scouting_dev.current_game;`, (err, runningMatchResults) => {
    
                if (runningMatchResults.length > 0) {
                    runningMatch = runningMatchResults[0].cg_gm_number
                    process.env.lastPlayedMatch = runningMatchResults[0].cg_gm_number
                }
    
    
                //get teams 
                const teams = {}
    
                for (let i = 0; i < results.length; i++) {
                    const currentTeam = results[i]
    
                    teams[i] = currentTeam
    
                    const date = new Date(teams[i].gm_timestamp)
                    const month = months[date.getUTCMonth()]
                    const day = date.getDate()
                    const h = addZero(date.getHours())
                    const m = addZero(date.getMinutes())
                    teams[i].time = month + " " + day + ", " + h + ":" + m
    
                    //consoleLog(teams[i])
                }
    
                teams.length = Object.keys(teams).length

                consoleLog("Rendering match listing")
    
                res.render("match-listing", {
                    teams: teams, 
                    isAdmin: isAdmin,
                    runningMatch: runningMatch,
                    lastPlayedMatch: process.env.lastPlayedMatch
                })
            })
        })
    }
})

router.post("/", function (req, res) {
    const body = req.body
    if (body.stop_match == true) { //stop match
        database.query(`delete from teamsixn_scouting_dev.current_game 
        where cg_sm_year > 0;`, (err, results) => {
            consoleLog(err)
            socketManager.emitAllSockets(body.gm_number, "stopMatch")
            res.send("match stopped")
        })

        database.query(database.clearMatchStretegyTemp(), (err, results) => {
            database.query(database.saveMatchStrategy(), (err, results) => {
                consoleLog(err)
                //consoleLog(results)
            })
            consoleLog(err)
            //consoleLog(results)
        })
    }
    else { //attempt to start match
        database.query(`select * from teamsixn_scouting_dev.current_game;`, (err, results) => { //match is already running
            if (results.length > 0) {
                res.status(200).send({ response: false, matchNumber: results[0].cg_gm_number })
            }
            else { //start new match
                database.query(`insert into teamsixn_scouting_dev.current_game 
                (cg_sm_year, cg_cm_event_code, cg_gm_game_type, cg_gm_number)
                select ` + body.year + ",'" + body.event_code + "','" + body.gm_type + "'," + body.gm_number + `;`, (err, results) => {
                    consoleLog(err)
                })

                process.env.lastPlayedMatch = body.gm_number
                
                socketManager.emitAllSockets(body.gm_number, "changeMatch")
                
                res.status(200).send({ response: true })
            }
        })
    }
})

module.exports = router