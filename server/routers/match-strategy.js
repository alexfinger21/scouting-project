import database from "../database/database.js"
import express from "express"
import { consoleLog } from "../utility.js"

const router = express.Router()

router.get("/",  function(req, res) { //only gets used if the url == match-strategy
    const match = req.query.match ? req.query.match : 1
    const getData = req.query.getData 
    consoleLog("SELECTED MATCH: " + match)
    consoleLog("GD: ", getData)
    //consoleLog(database.getMatchData(match))
    database.query(database.getGameNumbers(match), (err, gameNumbers) => {
        gameNumbers = JSON.parse(JSON.stringify(gameNumbers)) //convert RowDataPacket to object
        database.query(database.getMatchData(match), (err, matchup) => {
            consoleLog(err)
            //consoleLog("Time for query: " + Number(Date.now() - queryStart)/1000)
            //consoleLog("\n\n MATCHUP:")
            //consoleLog(matchup)
            matchup = JSON.parse(JSON.stringify(matchup)) //convert RowDataPacket to object
            consoleLog("\nMATCH DATA: ")
            consoleLog(matchup[0])

            if(getData == 1) {
                return res.status(200).send(JSON.stringify(matchup))
            }
    
            return res.render("match-strategy", {
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

export default router
