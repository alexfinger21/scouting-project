import database from "../database/database.js"
import express from "express"
import { consoleLog } from "../utility.js"

const router = express.Router()

router.get("/",  async function(req, res) { //only gets used if the url == match-strategy
    const match = req.query.match ? req.query.match : 1
    const getData = req.query.getData 
    consoleLog("SELECTED MATCH: " + match)
    consoleLog("GD: ", getData)
    let [err, gameNumbers] = await database.query(database.getGameNumbers(match)) 
    gameNumbers = JSON.parse(JSON.stringify(gameNumbers)) //convert RowDataPacket to object

    let [err2, matchup] = await database.query(database.getMatchData(match))
    matchup = JSON.parse(JSON.stringify(matchup)) //convert RowDataPacket to object

    for (const team in matchup) {
        const tmNum = matchup[team].team_master_tm_number
        const [dbErr, comments] = await database.query(database.getMatchComments(tmNum))

        if (!dbErr) {
            matchup[team].comments = comments
        }
    }


    if(getData == 1) {
        return res.status(200).send(JSON.stringify(matchup))
    }

    return res.render("match-strategy", {
        match: match,
        matchup: matchup,
        gameNumbers: gameNumbers,
    })
})

router.post("/", function(req, res) {
    const body = req.body
})

export default router
