const database = require("../database/database.js")
const express = require("express")
const gameConstants = require("../game.js")
const router = express.Router()

function rank(arr) {
    const sorted = arr.slice().sort((a, b) => b - a)
    const ranks = arr.map((e) => sorted.indexOf(e) + 1)
    return ranks
}

router.get("/", function (req, res) { //only gets used if the url == alliance-selector
    database.query(`select * from teamsixn_scouting_dev.v_alliance_selection_display`, (err, data) => {
        data = JSON.parse(JSON.stringify(data))
        console.log("ALLIANCE SELECTOR DATA")
        console.log(data)
        res.render("alliance-selector", {
            data: data
        })
    })
})

router.post("/", function (req, res) {
    const body = req.body

    database.query(`select * from teamsixn_scouting_dev.v_alliance_selection_display`, (err, data) => {
        data = JSON.parse(JSON.stringify(data))
        let disallowedTeams = []
        for (const e of data) {
            disallowedTeams.push(e.alliance_captain, e.alliance_first, e.alliance_second)
        }

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
            results = Array.from(JSON.parse(JSON.stringify(results)))
            console.log(results.map(e => e.team_master_tm_number))

            for (let i = 0; i < results.length; i++) {
                if (results[i].team_master_tm_number == null || disallowedTeams.indexOf(results[i].team_master_tm_number) != -1) {
                    console.log(results[i].team_master_tm_number)
                    console.log(results[i + 1].team_master_tm_number)

                    console.log("deleted")
                    results.splice(i, 1)
                    i--
                }
            }

            console.log(results.map(e => e.team_master_tm_number))
            //console.log(results)

            console.log(typeof(results))

            //remove dublicates
            for (let i = 0; i < results.length; i++) {
                for (let j = i+1; j < results.length; j++) {
                    if (results[i].team_master_tm_number == results[j].team_master_tm_number) {
                        results.splice(j, 1)
                        j--
                        console.log("deleted dublicate")
                    }
                }
            }

            console.log(results)

            console.log(results.map(e => e.team_master_tm_number))
            console.log(results.length)

            const GSRank = rank(results.map(e => e.avg_gm_score))
            const linkRank = rank(results.map(e => e.avg_nbr_links))
            const autonCSRank = rank(results.map(e => e.avg_auton_chg_station_score))
            const endGameCSRank = rank(results.map(e => e.avg_endgame_chg_station_score))
            const apiRank = results.map(e => e.api_rank)
            const totalRank = new Array(GSRank.length)
            const totalCSRank = rank(results.map(e => e.avg_endgame_chg_station_score + e.avg_auton_chg_station_score))

            for (let i = 0; i < GSRank.length; i++) {
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

                    let arrIndex = totalRank.indexOf(sortedRanks[rankings]) 

                    if (rankings)
                    console.log("og index = " + arrIndex)
                    console.log(totalRank[totalRank.indexOf(totalRank[rankings])])

                    let copy = totalRank.slice()

                    for (let i = 0; i<repeatCount; i++) {
                        copy.splice(arrIndex, 1)
                        arrIndex = copy.indexOf(totalRank[rankings]) + (i+1)
                        console.log(totalRank)
                        console.log(copy)
                    }

                    console.log("index - " + arrIndex)
                    //console.log(results)
                    //console.log(results[arrIndex])

                    allianceArr[rankings] = {
                        rank: rankings,
                        team: results[arrIndex].team_master_tm_number,
                        gameScore: results[arrIndex].avg_gm_score,
                        links: results[arrIndex].avg_nbr_links,
                        autonChargeStation: results[arrIndex].avg_auton_chg_station_score,
                        endgameChargeStation: results[arrIndex].avg_endgame_chg_station_score,
                        apiRank: results[arrIndex].api_rank
                    }
                }

                console.log(allianceArr)

                return res.status(200).send(allianceArr)
            } else if (body.sortBy == "scoring") {
                console.log(results.map(e => e.team_master_tm_number))
                const allianceArr = []
                const sortedRanks = GSRank.slice().sort((a, b) => a - b)

                //console.log(sortedRanks)

                for (let rankings = 0; rankings < GSRank.length; rankings++) {
                    let repeatCount = 0

                    for (let i = 0; i < rankings; i++) {
                        if (GSRank.indexOf(sortedRanks[rankings]) == GSRank.indexOf(sortedRanks[i])) {
                            repeatCount++
                            console.log("REPEAT COUNT: " + repeatCount)
                        }
                    }

                    let arrIndex = GSRank.indexOf(sortedRanks[rankings]) 

                    console.log("og index = " + arrIndex)
                    console.log(GSRank[GSRank.indexOf(sortedRanks[rankings])])

                    let copy = GSRank.slice()

                    for (let i = 0; i<repeatCount; i++) {
                        copy.splice(arrIndex, 1)
                        arrIndex = copy.indexOf(sortedRanks[rankings]) + (i+1)
                        console.log(GSRank)
                        console.log(copy)
                    }

                    console.log("index - " + arrIndex)
                    //console.log(results)
                    //console.log(results[arrIndex])

                    allianceArr[rankings] = {
                        rank: rankings,
                        team: results[arrIndex].team_master_tm_number,
                        gameScore: results[arrIndex].avg_gm_score,
                        links: results[arrIndex].avg_nbr_links,
                        autonChargeStation: results[arrIndex].avg_auton_chg_station_score,
                        endgameChargeStation: results[arrIndex].avg_endgame_chg_station_score,
                        apiRank: results[arrIndex].api_rank
                    }
                }

                console.log(allianceArr)

                return res.status(200).send(allianceArr)
            } else {
                console.log("here")
                //defense/charge station
                const allianceArr = []
                const sortedRanks = totalCSRank.slice().sort((a, b) => a - b)

                console.log(sortedRanks)
                console.log(totalCSRank)
                
                for (let rankings = 0; rankings < totalCSRank.length; rankings++) {
                    let repeatCount = 0

                    for (let i = 0; i < rankings; i++) {
                        if (totalCSRank.indexOf(sortedRanks[rankings]) == totalCSRank.indexOf(sortedRanks[i])) {
                            repeatCount++
                            console.log("REPEAT COUNT: " + repeatCount)
                        }
                    }

                    let arrIndex = totalCSRank.indexOf(sortedRanks[rankings]) 

                    console.log("og index = " + arrIndex)
                    console.log(totalCSRank[totalCSRank.indexOf(sortedRanks[rankings])])

                    let copy = totalCSRank.slice()

                    for (let i = 0; i<repeatCount; i++) {
                        copy.splice(arrIndex, 1)
                        arrIndex = copy.indexOf(sortedRanks[rankings]) + (i+1)
                        console.log(totalCSRank)
                        console.log(copy)
                    }

                    console.log("index - " + arrIndex)
                    //console.log(results)
                    //console.log(results[arrIndex])

                    allianceArr[rankings] = {
                        rank: rankings,
                        team: results[arrIndex].team_master_tm_number,
                        gameScore: results[arrIndex].avg_gm_score,
                        links: results[arrIndex].avg_nbr_links,
                        autonChargeStation: results[arrIndex].avg_auton_chg_station_score,
                        endgameChargeStation: results[arrIndex].avg_endgame_chg_station_score,
                        apiRank: results[arrIndex].api_rank
                    }
                }

                console.log(allianceArr)

                return res.status(200).send(allianceArr)
            }
        })
    })
})

module.exports = router