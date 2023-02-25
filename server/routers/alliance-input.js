const user = require("../user")
const database = require("../database/database.js")
const express = require("express")
const gameConstants = require("../game.js")
const game = require("../game.js")
const router = express.Router()

function rank(arr) {
    const sorted = arr.slice().sort((a, b) => b - a)
    const ranks = arr.map((e) => arr.indexOf(e) + 1)
    return ranks
}


router.get("/", function (req, res) { //only gets used if the url == team-details
    console.log("recieved")
    res.render("alliance-input", {

    })
})

router.post("/", function (req, res) {

    database.query(`SELECT 
             vmtsar.frc_season_master_sm_year,
              vmtsar.team_master_tm_number, 
              vmtsar.api_rank, 
              vmtsar.avg_gm_score,
              vmtsar.avg_nbr_links, 
              vmtsar.avg_auton_chg_station_score, 
              vmtsar.avg_endgame_chg_station_score 
         FROM 
             teamsixn_scouting_dev.v_match_team_score_avg_rankings vmtsar
         WHERE
             vmtsar.frc_season_master_sm_year = ${gameConstants.YEAR} AND
             vmtsar.competition_master_cm_event_code = '${gameConstants.COMP}' AND
             vmtsar.game_matchup_gm_game_type = '${gameConstants.GAME_TYPE}';`, 
    (err, results) => {
        console.log(results)
        return res.send("req recieved")
    })
})

module.exports = router