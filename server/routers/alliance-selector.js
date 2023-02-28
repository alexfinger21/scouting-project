const user = require("../user")
const express = require("express")
const router = express.Router()

const teams = { //TEST TEAMS
    
}

router.get("/",  function(req, res) { //only gets used if the url == alliance-selector
    res.render("alliance-selector", {
        teams: teams, user: user
    })
})

router.post("/", function(req, res) {
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
        console.log(JSON.parse(JSON.stringify(results)))
        const GSRank = rank(results.map(e => e.avg_gm_score))
        const linkRank = rank(results.map(e => e.avg_nbr_links))
        const autonCSRank = rank(results.map(e => e.avg_auton_chg_station_score))
        const endGameCSRank = rank(results.map(e => e.avg_endgame_chg_station_score))
        const apiRank = results.map(e => e.api_rank)
        const totalRank = new Array(GSRank.length)

        for (let i = 0; i<GSRank.length; i++) {
            totalRank[i] = GSRank[i] + linkRank[i] + autonCSRank[i] + endGameCSRank[i] + apiRank[i]
        }

        console.log(totalRank)

        const best = Math.min(...totalRank)

        console.log(best)

        for ([key, value] of Object.entries(totalRank)) {
            if (value == best) {
                console.log(results[key])
            }
        }

        for ([key, value] of Object.entries(GSRank)) {
            if (value == 4) {
                console.log(results[key])
            }
        }

        for ([key, value] of Object.entries(apiRank)) {
            if (value == 1) {
                console.log(results[key])
            }
        }

        return res.send("req recieved")
    })
})

module.exports = router