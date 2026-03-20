import database from "../database/database.js"
import express from "express"
import { consoleLog } from "../utility.js"
import {
    buildMatchStrategyPitSummary,
    getMergedPitScoutingData,
} from "../pit-scouting.js"

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
    let [err3, teamResults] = await database.query(database.getTeamDetailsTeamData())
    teamResults = JSON.parse(JSON.stringify(teamResults ?? []))

    consoleLog(err)
    consoleLog(err2)
    consoleLog(err3)

    await Promise.all(matchup.map(async (team) => {
        const tmNum = team.team_master_tm_number
        const [[dbErr, comments], pitData] = await Promise.all([
            database.query(database.getMatchComments(tmNum)),
            getMergedPitScoutingData(req, tmNum, teamResults),
        ])

        team.comments = !dbErr
            ? JSON.parse(JSON.stringify(comments ?? []))
            : []
        team.pitSummary = buildMatchStrategyPitSummary(pitData)
    }))


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
