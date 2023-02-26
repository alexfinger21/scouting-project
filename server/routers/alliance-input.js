const user = require("../user")
const database = require("../database/database.js")
const express = require("express")
const gameConstants = require("../game.js")
const game = require("../game.js")
const router = express.Router()

function rank(arr) {
    const sorted = arr.slice().sort((a, b) => b - a)
    const ranks = arr.map((e) => sorted.indexOf(e) + 1)
    return ranks
}


router.get("/", function (req, res) { //only gets used if the url == team-details
    console.log("recieved")
    database.query(`SELECT
    DISTINCT team_master_tm_number 
    FROM 
        teamsixn_scouting_dev.alliance_sel_rank
    ORDER BY
        team_master_tm_number;`,
    (err, team_results) => {
        res.render("alliance-input", {
            teams: team_results.map(e => e.team_master_tm_number).sort((a, b) => a - b)
        })
    })
})

router.post("/", function (req, res) {
    const body = req.body
    database.query(database.deleteAllianceSelection(body.allianceNum, body.pos, body.team), (err, result) => {console.log(result)})
    if (body.action == "insert") {
        database.query(database.insertAllianceSelection(body.allianceNum, body.pos, body.team), (err, result) => {console.log(result)})
    }
})

module.exports = router