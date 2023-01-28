const user = require("../user")
const express = require("express")
const router = express.Router()
require('dotenv').config()
const database = require("../database/database.js")
const YEAR = 2023

const teams = { //TEST TEAMS
    
}

function addZero(num) {
    return num<10 ? "0" + num : num
}

router.get("/",  function(req, res) {
    database.query(`SELECT * FROM game_matchup gm 
    WHERE gm.frc_season_master_sm_year = ` + YEAR + `
    ORDER BY gm_number ASC;`, (err, results) => {
        const date = new Date(results[0].gm_timestamp)
        const h = addZero(date.getHours())
        const m = addZero(date.getMinutes())
        teams.time = h + ":" + m

        console.log(teams.time)
        res.render("match-listing", {
            teams: teams, user: user
        })
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log(body)
})

module.exports = router