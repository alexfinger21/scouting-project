const user = require("../user")
const express = require("express")
const router = express.Router()
require('dotenv').config()
const database = require("../database/database.js")
const { checkAdmin } = require("../utility")
const io = require("../server.js")
const socketManager = require("../sockets.js")
const YEAR = 2023

function addZero(num) {
    return num < 10 ? "0" + num : num
}

router.get("/", async function (req, res) {
    database.query(database.getTeams(), async (err, results) => {
        //get isAdmin
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
                const h = addZero(date.getHours())
                const m = addZero(date.getMinutes())
                teams[i].time = h + ":" + m
            }

            teams.length = Object.keys(teams).length

            res.render("match-listing", {
                teams: teams, 
                user: user,
                isAdmin: isAdmin,
                runningMatch: runningMatch
            })
        })

    })
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
                
                socketManager.emitAllSockets(body.gm_number, "changeMatch")
                
                res.status(200).send({ response: true })
            }
        })
    }
})

module.exports = router