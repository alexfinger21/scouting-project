const user = require("../user")
const express = require("express")
const router = express.Router()
require('dotenv').config()
const database = require("../database/database.js")
const YEAR = 2023

const teams = { //TEST TEAMS
    
}

router.get("/",  function(req, res) {
    database.query(`SELECT * FROM game_matchup gm 
    WHERE gm.frc_season_master_sm_year = ` + YEAR + `
    ORDER BY gm_number ASC;`, (err, results) => {
        console.log(results[0])
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