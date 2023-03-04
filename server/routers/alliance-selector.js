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
    database.query(`select * from teamsixn_scouting_dev.v_alliance_selection_display`, (err, data) => {
        data = JSON.parse(JSON.stringify(data))
        console.log("ALLIANCE SELECTOR DATA")
        console.log(data)
        res.render("alliance-selector", {
            user: user,
            data: data
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
        console.log(results.map(e => e.team_master_tm_number))

        for (let i = 0; i<results.length - 1; i++) {
            if ((results[i].team_master_tm_number == results[i+1].team_master_tm_number) || results[i].team_master_tm_number == null) {
                console.log(results[i].team_master_tm_number)
                console.log(results[i+1].team_master_tm_number)

                console.log("deleted")
                results.splice(i, 1)
                i--
            }
        }
        console.log(results.map(e => e.team_master_tm_number))

        const GSRank = rank(results.map(e => e.avg_gm_score))
        const linkRank = rank(results.map(e => e.avg_nbr_links))
        const autonCSRank = rank(results.map(e => e.avg_auton_chg_station_score))
        const endGameCSRank = rank(results.map(e => e.avg_endgame_chg_station_score))
        const apiRank = results.map(e => e.api_rank)
        const totalRank = new Array(GSRank.length)

        for (let i = 0; i<GSRank.length; i++) {
            totalRank[i] = GSRank[i] + linkRank[i] + autonCSRank[i] + endGameCSRank[i] + apiRank[i]
        }

        //console.log(totalRank)

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
            console.log(results.map(e => e.team_master_tm_number))
            const allianceArr = []
            const sortedRanks = totalRank.slice().sort((a, b) => a - b)
            
            //console.log(sortedRanks)

            for (let rankings = 0; rankings < GSRank.length; rankings++) {
                let repeatCount = 0

                for (let i = 0; i < rankings; i++) {
                    if (totalRank.indexOf(sortedRanks[rankings]) == totalRank.indexOf(sortedRanks[i])) {
                        repeatCount++
                        console.log("REPEAT COUNT: " + repeatCount)
                    }
                }

                const arrIndex = totalRank.indexOf(sortedRanks[rankings]) + repeatCount

                console.log("index - " + arrIndex)
                //console.log(results)
                //console.log(results[arrIndex])

                allianceArr[rankings] = {
                    rank: rankings,
                    team: results[arrIndex].team_master_tm_number, 
                    gameScore: results[arrIndex].avg_gm_score, 
                    chargeStation: results[arrIndex].avg_auton_chg_station_score + results[arrIndex].avg_endgame_chg_station_score,
                    apiRank: results[arrIndex].api_rank
                }
            }

            console.log(allianceArr)

            return res.status(200).send(allianceArr)
        } else if (body.sortBy == "scoring") {
            
        } else {
            //defense

        }
    })
})

module.exports = router