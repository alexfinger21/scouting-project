const user = require("../user")
const express = require("express")
const router = express.Router()
require('dotenv').config()
const database = require("../database/database.js")
const { data } = require("jquery")
const YEAR = 2023

function addZero(num) {
    return num<10 ? "0" + num : num
}

router.get("/",  function(req, res) {
    database.query(database.getTeams(), (err, results) => {
        const teams = {}

        for (let i = 0; i<results.length; i++) {
            const currentTeam = results[i]

            teams[i] = currentTeam

            const date = new Date(teams[i].gm_timestamp)
            const h = addZero(date.getHours())
            const m = addZero(date.getMinutes())
            teams[i].time = h + ":" + m
        }

        teams.length = Object.keys(teams).length

        console.log(teams)
        
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