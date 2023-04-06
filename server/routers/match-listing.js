const express = require("express")
const router = express.Router()
require('dotenv').config()
const database = require("../database/database.js")
const { checkAdmin } = require("../utility")
const socketManager = require("../sockets.js")
const { data } = require("jquery")
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

let lastPlayedMatch = 1

function addZero(num) {
    return num < 10 ? "0" + num : num
}

router.get("/", async function (req, res) {
    console.log("Get collected data: " + req.query.getCollectedData)
    if ("" + req.query.getCollectedData == "true") {
        console.log("nice")
        database.query(database.getCollectedData(req.query.matchNumber), (err, results) => {
            res.status(200).send(results)
        })
    }
    else {
        database.query(database.getTeams(), async (err, results) => {
            //get isAdmin
            console.log(err)
            const isAdmin = await checkAdmin(req)
    
            //get running game
            let runningMatch = -1
            database.query(`select * from teamsixn_scouting_dev.current_game;`, (err, runningMatchResults) => {
    
                if (runningMatchResults.length > 0) {
                    runningMatch = runningMatchResults[0].cg_gm_number
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
    
                    //console.log(teams[i])
                }
    
                teams.length = Object.keys(teams).length
    
                res.render("match-listing", {
                    teams: teams, 
                    isAdmin: isAdmin,
                    runningMatch: runningMatch,
                    lastPlayedMatch: lastPlayedMatch
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
            console.log(err)
            socketManager.emitAllSockets(body.gm_number, "stopMatch")
            res.send("match stopped")
        })

        database.query(database.saveMatchStrategy(), (err, results) => {
            console.log(err)
            console.log(results)
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
                    console.log(err)
                })

                lastPlayedMatch = body.gm_number
                
                socketManager.emitAllSockets(body.gm_number, "changeMatch")
                
                res.status(200).send({ response: true })
            }
        })
    }
})

module.exports = router