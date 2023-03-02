const user = require("../user")
const { returnAPIDATA } = require("../getRanks")
const express = require("express")
const { checkAdmin } = require("../utility")
const database = require("../database/database")
const { json } = require("express")
const router = express.Router()
const gameConstants = require("../game.js")

function addZero(num) {
    return num < 10 ? "0" + num : num
}

router.get("/", async function (req, res) { //only gets used if the url == team-summary
    const isAdmin = await checkAdmin(req)
    database.query(`SELECT * FROM teamsixn_scouting_dev.api_rankings WHERE api_rankings.frc_season_master_sm_year = ${gameConstants.YEAR}
    AND api_rankings.competition_master_cm_event_code = '${gameConstants.COMP} `, (err, results) => {
        results = JSON.parse(JSON.stringify(results))

        results.sort((a, b) => a.api_rank - b.api_rank)

        console.log(results[0].api_rank_ts)

        res.render("rankings", {
            user: user,
            isAdmin: isAdmin,
            year: results[0].frc_season_master_sm_year,
            eventCode: results[0].competition_master_cm_event_code,
            timeStamp: results[0].api_rank_ts,
            teamStats: results
        })
    })


})

router.post("/", function (req, res) {
    const body = req.body
    console.log(body)
})

module.exports = router