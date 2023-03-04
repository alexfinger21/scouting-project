const database = require("../database/database.js")
const express = require("express")
const router = express.Router()

router.get("/",  function(req, res) { //only gets used if the url == match-strategy
    const match = req.query.match ? req.query.match : 1
    console.log("SELECTED MATCH: " + match)
    console.log(database.getMatchData(match))
    database.query(database.getGameNumbers(match), (err, gameNumbers) => {
        gameNumbers = JSON.parse(JSON.stringify(gameNumbers)) //convert RowDataPacket to object
        database.query(database.getMatchData(match), (err, matchup) => {
            console.log(matchup)
            matchup = JSON.parse(JSON.stringify(matchup)) //convert RowDataPacket to object
            console.log("\n\n MATCHUP:")
    
            res.render("match-strategy", {
                match: match,
                matchup: matchup,
                gameNumbers: gameNumbers,
            })
        })
    })
})

router.post("/", function(req, res) {
    const body = req.body
})

module.exports = router