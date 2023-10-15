const database = require("../database/database.js")
const express = require("express")
const gameConstants = require("../game.js")
const { consoleLog } = require("../utility")
const router = express.Router()

//returns an array where the team is substituted for the rank
function rank(arr) {
    const sorted = arr.slice().sort((a, b) => b - a)
    const ranks = arr.map((e) => sorted.indexOf(e) + 1)
    return ranks
}

router.get("/", function (req, res) { //only gets used if the url == alliance-selector
    database.query(`select * from teamsixn_scouting_dev.v_alliance_selection_display`, (err, data) => {
        data = JSON.parse(JSON.stringify(data))
        consoleLog("ALLIANCE SELECTOR DATA")
        //consoleLog(data)
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
            consoleLog(results.map(e => e.team_master_tm_number))

            //remove disallowed teams
            for (let i = 0; i < results.length; i++) {
                if (results[i].team_master_tm_number == null || disallowedTeams.indexOf(results[i].team_master_tm_number) != -1) {
                    consoleLog(results[i].team_master_tm_number)
                    consoleLog(results[i + 1].team_master_tm_number)

                    consoleLog("deleted")
                    results.splice(i, 1)
                    i--
                }
            }

            consoleLog(results.map(e => e.team_master_tm_number))
            //consoleLog(results)

            consoleLog(typeof(results))

            //remove duplicates
            for (let i = 0; i < results.length; i++) {
                for (let j = i+1; j < results.length; j++) {
                    if (results[i].team_master_tm_number == results[j].team_master_tm_number) {
                        results.splice(j, 1)
                        j--
                        consoleLog("deleted duplicate")
                    }
                }
            }

            //consoleLog(results)

            consoleLog(results.map(e => e.team_master_tm_number))
            consoleLog(results.length)

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

            consoleLog(GSRank)

            //consoleLog(totalRank)

            const best = Math.min(...totalRank)

            consoleLog(best)

            for ([key, value] of Object.entries(totalRank)) {
                if (value == best) {
                    consoleLog(results[key])
                }
            }

            for ([key, value] of Object.entries(GSRank)) {
                if (value == 4) {
                    consoleLog(results[key])
                }
            }

            for ([key, value] of Object.entries(apiRank)) {
                if (value == 1) {
                    consoleLog(results[key])
                }
            }

            if (body.sortBy == "best") {
                consoleLog(results.map(e => e.team_master_tm_number))
                const allianceArr = []
                const sortedRanks = totalRank.slice().sort((a, b) => a - b)

                //consoleLog(sortedRanks)

                for (let rankings = 0; rankings < GSRank.length; rankings++) {
                    let repeatCount = 0

                    for (let i = 0; i < rankings; i++) {
                        if (totalRank.indexOf(sortedRanks[rankings]) == totalRank.indexOf(sortedRanks[i])) {
                            repeatCount++
                            //consoleLog("REPEAT COUNT: " + repeatCount)
                        }
                    }

                    let arrIndex = totalRank.indexOf(sortedRanks[rankings]) 

                    if (rankings == 5) {
                        //consoleLog("og index = " + arrIndex)
                        //consoleLog(totalRank[totalRank.indexOf(totalRank[rankings])])
                    }

                    let copy = totalRank.slice()

                    for (let i = 1; i<=repeatCount; i++) {
                        copy.splice(arrIndex, 1)
                        arrIndex = copy.indexOf(sortedRanks[rankings])
                        //consoleLog(totalCSRank)
                        //consoleLog(copy)
                    }

                    arrIndex += repeatCount

                    consoleLog("index - " + arrIndex)
                    //consoleLog(results)
                    //consoleLog(results[arrIndex])

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

                //consoleLog(allianceArr)

                return res.status(200).send(allianceArr)
            } else if (body.sortBy == "scoring") {
                consoleLog(results.map(e => e.team_master_tm_number))
                const allianceArr = []
                const sortedRanks = GSRank.slice().sort((a, b) => a - b)

                //consoleLog(sortedRanks)

                for (let rankings = 0; rankings < GSRank.length; rankings++) {
                    let repeatCount = 0

                    for (let i = 0; i < rankings; i++) {
                        if (GSRank.indexOf(sortedRanks[rankings]) == GSRank.indexOf(sortedRanks[i])) {
                            repeatCount++
                            consoleLog("REPEAT COUNT: " + repeatCount)
                        }
                    }

                    let arrIndex = GSRank.indexOf(sortedRanks[rankings]) 

                    consoleLog("og index = " + arrIndex)
                    consoleLog(GSRank[GSRank.indexOf(sortedRanks[rankings])])

                    let copy = GSRank.slice()

                    for (let i = 1; i<=repeatCount; i++) {
                        copy.splice(arrIndex, 1)
                        arrIndex = copy.indexOf(sortedRanks[rankings])
                        //consoleLog(totalCSRank)
                        //consoleLog(copy)
                    }

                    arrIndex += repeatCount

                    consoleLog("index - " + arrIndex)
                    //consoleLog(results)
                    //consoleLog(results[arrIndex])

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

                consoleLog(allianceArr)

                return res.status(200).send(allianceArr)
            } else {
                //defense/charge station
                consoleLog("here")
                const allianceArr = []
                const sortedRanks = totalCSRank.slice().sort((a, b) => a - b)

                consoleLog(sortedRanks)
                consoleLog(totalCSRank)
                
                for (let rankings = 0; rankings < totalCSRank.length; rankings++) {
                    let repeatCount = 0

                    for (let i = 0; i < rankings; i++) {
                        if (totalCSRank.indexOf(sortedRanks[rankings]) == totalCSRank.indexOf(sortedRanks[i])) {
                            repeatCount++
                        }
                    }

                    consoleLog("REPEAT COUNT: " + repeatCount)

                    let arrIndex = totalCSRank.indexOf(sortedRanks[rankings]) 

                    consoleLog("og index = " + arrIndex)
                    consoleLog(totalCSRank[totalCSRank.indexOf(sortedRanks[rankings])])

                    copy = totalCSRank.slice()

                    for (let i = 1; i<=repeatCount; i++) {
                        copy.splice(arrIndex, 1)
                        arrIndex = copy.indexOf(sortedRanks[rankings])
                        //consoleLog(totalCSRank)
                        //consoleLog(copy)
                    }

                    arrIndex += repeatCount

                    consoleLog(`AFTER REMOVING DUBLICATES vs ORIGINAL INDEX: ${arrIndex} vs ${totalCSRank.indexOf(sortedRanks[rankings])}`)

                    consoleLog("index - " + arrIndex)
                    //consoleLog(results)
                    //consoleLog(results[arrIndex])
                    
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

                //consoleLog(allianceArr)

                return res.status(200).send(allianceArr)
            }
        })
    })
})

module.exports = router