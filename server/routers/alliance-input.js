const user = require("../user")
const database = require("../database/database.js")
const express = require("express")
const gameConstants = require("../game.js")
const game = require("../game.js")
const router = express.Router()

router.get("/", function (req, res) { //only gets used if the url == team-details
    console.log("recieved")
    database.query(`SELECT
    DISTINCT team_master_tm_number 
    FROM 
        teamsixn_scouting_dev.alliance_sel_rank
    ORDER BY
        team_master_tm_number;`,
    (err, team_results) => {
        if (!req.query.getTeams) {
            res.render("alliance-input", {
                teams: team_results.map(e => e.team_master_tm_number).sort((a, b) => a - b)
            })
        } else {
            return res.status(200).send({teams: team_results.map(e => e.team_master_tm_number).sort((a, b) => a - b)})
        }
    })
})

router.post("/", function (req, res) {
    const body = req.body
    console.log("BODY: ")
    console.log(body)
    database.query(database.deleteAllianceSelection(body.allianceNum, body.pos, body.team), (err, result) => {console.log(result)})
    if (body.action == "INSERT") {
        database.query(database.insertAllianceSelection(body.allianceNum, body.pos, body.team), (err, result) => {console.log(result)})
    }
})

module.exports = router