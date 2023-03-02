const user = require("../user")
const database = require("../database/database.js")
const express = require("express")
const gameConstants = require("../game.js")
const router = express.Router()

function rank(arr) {
    const sorted = arr.slice().sort((a, b) => b - a)
    const ranks = arr.map((e) => sorted.indexOf(e) + 1)
    return ranks
}

router.get("/",  function(req, res) { //only gets used if the url == alliance-selector
    database.query(`select * from teamsixn_scouting_dev.v_alliance_selection_display`, (err, results) => {
        results = JSON.parse(JSON.stringify(results))
        console.log("ALLIANCE INPUT: ")
        console.log(results)
        res.render("alliance-selector", {
            user: user,
            results: results
        })
    })
})

router.post("/", function(req, res) {
    const body = req.body

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
        results = JSON.parse(JSON.stringify(results))

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

        if (body.sortBy == "best") {
            const allianceArr = []
            const sortedRanks = totalRank.slice().sort((a, b) => a - b)
            
            console.log(sortedRanks)

            for (let rankings = 0; rankings < GSRank.length; rankings++) {
                const arrIndex = totalRank.indexOf(sortedRanks[rankings])

                console.log("index - " + arrIndex)
                console.log(results)
                console.log(results[arrIndex])

                allianceArr[rankings] = {
                    rank: sortedRanks[rankings],
                    team: results[arrIndex].team_master_tm_number, 
                    gameScore: results[arrIndex].avg_gm_score, 
                    chargeStation: results[arrIndex].avg_auton_chg_station_score + results[arrIndex].avg_endgame_chg_station_score,
                    apiRank: results[arrIndex].api_rank
                }
            }

            console.log(allianceArr)

            return res.status(200).send(allianceArr)
        }
    })
})

module.exports = router