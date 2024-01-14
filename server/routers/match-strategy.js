const database = require("../database/database.js")
const express = require("express")
const { query } = require("express")
const { consoleLog } = require("../utility")
const router = express.Router()

router.get("/",  function(req, res) { //only gets used if the url == match-strategy
    const match = req.query.match ? req.query.match : 1
    //consoleLog("SELECTED MATCH: " + match)
    //consoleLog(database.getMatchData(match))
    database.query(database.getGameNumbers(match), (err, gameNumbers) => {
        gameNumbers = JSON.parse(JSON.stringify(gameNumbers)) //convert RowDataPacket to object
        const queryStart = Date.now()
        database.query(database.getMatchData(match), (err, matchup) => {
            //consoleLog("Time for query: " + Number(Date.now() - queryStart)/1000)
            //consoleLog("\n\n MATCHUP:")
            //consoleLog(matchup)
            matchup = JSON.parse(JSON.stringify(matchup)) //convert RowDataPacket to object
            //consoleLog("\nMATCH DATA: ")
            //consoleLog(matchup)
    
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