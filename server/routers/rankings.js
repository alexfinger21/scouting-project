import express from "express"
import { checkAdmin, consoleLog } from "../utility.js"
import database from "../database/database"
import gameConstants from "../game.js"
import game from "../game.js"
import SQL from "sql-template-strings"

const router = express.Router()

function addZero(num) {
    return num < 10 ? "0" + num : num
}

router.get("/", async function (req, res) { //only gets used if the url == team-summary
    const isAdmin = await checkAdmin(req)
    database.query(SQL`SELECT * FROM teamsixn_scouting_dev.api_rankings WHERE api_rankings.frc_season_master_sm_year = ${gameConstants.YEAR}
    AND api_rankings.competition_master_cm_event_code = ${game.COMP}`, (err, results) => {
        results = JSON.parse(JSON.stringify(results))

        if (results) results.sort((a, b) => a.api_rank - b.api_rank)
        
        if (results.length == 0) results = null

        //consoleLog(results)
        //consoleLog(gameConstants.gameStart.toLocaleString())
        
        res.render("rankings", {
            isAdmin: isAdmin,
            year: results != null ? results[0].frc_season_master_sm_year : gameConstants.YEAR,
            eventCode: results != null ? results[0].competition_master_cm_event_code: gameConstants.COMP,
            timeStamp: results != null ? String(results[0].api_rank_ts).replace(/ /g, '_') : gameConstants.gameStart.toLocaleString(),
            teamStats: results != null ? results : []
        })
    })


})

router.post("/", function (req, res) {
    const body = req.body
    consoleLog(body)
})

export default router
