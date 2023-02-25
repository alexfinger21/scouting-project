const user = require("../user")
const database = require("../database/database.js")
const express = require("express")
const gameConstants = require("../game.js")
const router = express.Router()

router.get("/", function (req, res) { //only gets used if the url == team-details
    console.log("recieved")
    const team = req.query.team ? req.query.team : 695

    database.query(`SELECT 
        * 
        FROM 
            teamsixn_scouting_dev.v_match_team_score vmts
        WHERE
            vmts.frc_season_master_sm_year = ${gameConstants.YEAR} AND
            vmts.competition_master_cm_event_code = '${gameConstants.COMP}' AND 
            vmts.game_matchup_gm_game_type = '${gameConstants.GAME_TYPE}' AND
            vmts.team_master_tm_number = ${team};`,
        (err, results) => {
            results = JSON.parse(JSON.stringify(results))
            database.query(`SELECT 
                DISTINCT team_master_tm_number 
                FROM 
                    teamsixn_scouting_dev.v_match_team_score vmts
                WHERE
                    vmts.frc_season_master_sm_year = ${gameConstants.YEAR} AND
                    vmts.competition_master_cm_event_code = '${gameConstants.COMP}' AND 
                    vmts.game_matchup_gm_game_type = '${gameConstants.GAME_TYPE}';`,
                (err, team_results) => {
                    console.log("RESULTS: ")
                    console.log(results)
                    res.render("team-details", {
                        teams: team_results.map(e => e.team_master_tm_number),
                        teamData: results,
                        selectedTeam: team,
                        user: user,
                    })
                })
        })
})

router.post("/", function (req, res) {
    return res.send("req recieved")
})

module.exports = router