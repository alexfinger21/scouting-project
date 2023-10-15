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

//removes any duplicate teams in what the DB returns
function removeDuplicates(data) {
    for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
            if (data[i].team_master_tm_number == data[j].team_master_tm_number) {
                data.splice(j, 1)
                j--
                consoleLog("deleted duplicate")
            }
        }
    }
}

function removeTeams(data, disallowedTeams) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].team_master_tm_number == null || disallowedTeams.indexOf(data[i].team_master_tm_number) != -1) {
            consoleLog(data[i].team_master_tm_number)
            consoleLog(data[i + 1].team_master_tm_number)
            consoleLog("deleted")
            data.splice(i, 1)
            i--
        }
    }
}

//returns data sorted by the totalRank array
function sortBy(data, totalRank) {
    const res = []
    const sortedRanks = totalRank.slice().sort((a, b) => a - b)

    //consoleLog(sortedRanks)

    for (let rankings = 0; rankings < totalRank.length; rankings++) {
        let repeatCount = 0

        for (let i = 0; i < rankings; i++) {
            if (totalRank.indexOf(sortedRanks[rankings]) == totalRank.indexOf(sortedRanks[i])) {
                repeatCount++
                //consoleLog("REPEAT COUNT: " + repeatCount)
            }
        }

        let arrIndex = totalRank.indexOf(sortedRanks[rankings])

        let copy = totalRank.slice()

        for (let i = 1; i <= repeatCount; i++) {
            copy.splice(arrIndex, 1)
            arrIndex = copy.indexOf(sortedRanks[rankings])
            //consoleLog(totalCSRank)
            //consoleLog(copy)
        }

        arrIndex += repeatCount

        consoleLog("index - " + arrIndex)
        //consoleLog(data)
        //consoleLog(data[arrIndex])

        res[rankings] = {
            rank: rankings,
            team: data[arrIndex].team_master_tm_number,
            gameScore: data[arrIndex].avg_gm_score,
            links: data[arrIndex].avg_nbr_links,
            autonChargeStation: data[arrIndex].avg_auton_chg_station_score,
            endgameChargeStation: data[arrIndex].avg_endgame_chg_station_score,
            apiRank: data[arrIndex].api_rank
        }
    }

    return res
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
            (err, data) => {
                data = Array.from(JSON.parse(JSON.stringify(data)))

                consoleLog("Alliance Selector Input: ")
                consoleLog(data)

                //remove do not pick list from the data
                removeTeams(data, disallowedTeams)

                //remove duplicates (to do make them red)
                //removeDuplicates(data)

                //consoleLog(data)

                const GSRank = rank(data.map(e => e.avg_gm_score))
                const linkRank = rank(data.map(e => e.avg_nbr_links))
                const autonCSRank = rank(data.map(e => e.avg_auton_chg_station_score))
                const endGameCSRank = rank(data.map(e => e.avg_endgame_chg_station_score))
                const apiRank = data.map(e => e.api_rank)
                const totalRank = new Array(GSRank.length)
                const totalCSRank = rank(data.map(e => e.avg_endgame_chg_station_score + e.avg_auton_chg_station_score))

                if (body.sortBy == "best") {
                    //Weights are even
                    for (let i = 0; i < GSRank.length; i++) {
                        totalRank[i] = GSRank[i] + linkRank[i] + totalCSRank[i] + apiRank[i]
                    }
                } else if (body.sortBy == "scoring") {
                    //Only weigh game score
                    for (let i = 0; i < GSRank.length; i++) {
                        totalRank[i] = GSRank[i]
                    }
                } else {
                    //Weigh charging station score
                    for (let i = 0; i < GSRank.length; i++) {
                        totalRank[i] = totalCSRank[i]
                    }
                }
                return res.status(200).send(sortBy(data, totalRank))
            })
    })
})

module.exports = router