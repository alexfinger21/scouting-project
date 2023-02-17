const user = require("../user")
const database = require("../database/database.js")
const express = require("express")
const router = express.Router()

let selectedMatch = 1

router.get("/",  function(req, res) { //only gets used if the url == match-strategy
    const match = req.query.match ? req.query.match : 1
    console.log("SELECTED MATCH: " + match)
    database.query(database.getGameNumbers(match), (err, gameNumbers) => {
        gameNumbers = JSON.parse(JSON.stringify(gameNumbers)) //convert RowDataPacket to object
        database.query(database.getMatchData(match), (err, matchup) => {
            console.log(matchup)
            matchup = JSON.parse(JSON.stringify(matchup)) //convert RowDataPacket to object
            console.log("\n\n MATCHUP:")
            console.log(matchup.map(e => e.team_master_tm_number))
    
            res.render("match-strategy", {
                match: match,
                matchup: matchup,
                gameNumbers: gameNumbers,
                user: user,
            })
        })
    })
})

router.post("/", function(req, res) {
    const body = req.body
    selectedMatch = body.matchNumber
})

module.exports = router