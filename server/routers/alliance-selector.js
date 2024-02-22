const database = require("../database/database.js")
const express = require("express")
const gameConstants = require("../game.js")
const { consoleLog } = require("../utility")
const router = express.Router()
const SQL = require('sql-template-strings')

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
            //consoleLog(data[i].team_master_tm_number)
            //consoleLog(data[i + 1].team_master_tm_number)
            //consoleLog("deleted")
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

        //consoleLog("index - " + arrIndex)
        //consoleLog(data)

        res[rankings] = {
            rank: rankings,
            team: data[arrIndex].team_master_tm_number,
            gameScore: data[arrIndex].total_game_score_avg,
            auton: data[arrIndex].auton_total_score_avg,
            speakerScore: data[arrIndex].auton_notes_speaker_avg + data[arrIndex].teleop_notes_speaker_amped_avg + data[arrIndex].teleop_notes_speaker_not_amped_avg,
            ampScore: data[arrIndex].auton_notes_amp_avg + data[arrIndex].teleop_notes_amp_avg,
            stageScore: data[arrIndex].endgame_onstage_points_avg + data[arrIndex].endgame_notes_trap_avg,
            apiRank: data[arrIndex].api_rank
        }
        consoleLog(res[rankings])
    }

    return res
}

router.get("/", async function (req, res) { //only gets used if the url == alliance-selector
    let [err, data] = await database.query(SQL`select * from teamsixn_scouting_dev.v_alliance_selection_display`)
    data = JSON.parse(JSON.stringify(data))
    //consoleLog("ALLIANCE SELECTOR DATA")
    //consoleLog(data)
    res.render("alliance-selector", {
        data: data
    })
})

router.post("/", async function (req, res) {
    const body = req.body

    let [err1, dbRes] = await database.query(SQL`select * from teamsixn_scouting_dev.v_alliance_selection_display`)
    
    dbRes = JSON.parse(JSON.stringify(dbRes))
    
    //consoleLog("DATABASE RESULT:", dbRes)

    const disallowedTeams = []
   
    let [err2, data] = await database.query(SQL`select * from teamsixn_scouting_dev.v_match_summary_api
        vmd WHERE vmd.frc_season_master_sm_year = ${gameConstants.YEAR} and vmd.competition_master_cm_event_code = ${gameConstants.COMP}`)
   
    data = Array.from(JSON.parse(JSON.stringify(data)))

    //consoleLog("SUMMARY API RESULT:", data)
    
    for (const e of data) {
        disallowedTeams.push(e.alliance_captain, e.alliance_first, e.alliance_second)
    }

    //consoleLog("Alliance Selector Input: ")
    //consoleLog(data)

    //remove do not pick list from the data
    removeTeams(data, disallowedTeams)

    //remove duplicates (to do make them red)
    //removeDuplicates(data)

    //consoleLog(data)

    const GSRank = rank(data.map(e => e.total_game_score_avg))
    const autonRank = rank(data.map(e => e.auton_total_score_avg))
    const ampRank = rank(data.map(e => e.auton_notes_amp_avg + e.teleop_notes_amp_avg))
    const speakerRank = rank(data.map(e => e.auton_notes_speaker_avg + e.teleop_notes_speaker_amped_avg + e.teleop_notes_speaker_not_amped_avg))
    const ampedSpeakerRank = rank(data.map(e => e.teleop_notes_amped_speaker_avg))
    const stageRank = rank(data.map(e => e.endgame_onstage_points_avg))
    const trapRank = rank(data.map(e => e.endgame_notes_trap_avg))
    const apiRank = rank(data.map(e => e.api_rank))

    const totalRank = new Array(GSRank.length)

    if (body.sortBy == "best") {
        //Weights are even
        for (let i = 0; i < GSRank.length; ++i) {
            totalRank[i] = GSRank[i] 
                + autonRank[i] 
                + ampRank[i]
                + speakerRank[i]
                + ampedSpeakerRank[i]
                + stageRank[i]
                + trapRank[i]
                + apiRank[i]
        }
    } else if (body.sortBy == "scoring") {
        //Only weigh game score
        for (let i = 0; i < GSRank.length; ++i) {
            totalRank[i] = GSRank[i]
        }
    } else if (body.sortBy == "auton") {
        //Weigh auton score
        for (let i = 0; i < GSRank.length; ++i) {
            totalRank[i] = autonRank[i]
        }
    } else if (body.sortBy == "speaker") {
        //Weigh speaker score
         for (let i = 0; i < GSRank.length; ++i) {
            totalRank[i] = speakerRank[i]
         } 
    } else if (body.sortBy == "amp") {
        //Weigh amp score
         for (let i = 0; i < GSRank.length; ++i) {
            totalRank[i] = ampRank[i]
         }
    } else if (body.sortBy == "stage") {
        //Weigh stage score
         for (let i = 0; i < GSRank.length; ++i) {
            totalRank[i] = stageRank[i]
         }
    } else {//trap
        //Weigh trap score
         for (let i = 0; i < GSRank.length; ++i) {
            totalRank[i] = trapRank[i]
         }
    }


    const ogData = data.slice()
    //consoleLog(ogData)
    for (let i = 0; i < totalRank.length - 1; ++i) {
        const dublicateIndex = totalRank.indexOf(totalRank[i], i + 1)
        if (dublicateIndex != -1) {
            //Priority order: Game score is most important, then links, then charge station
            if (GSRank[i] > GSRank[dublicateIndex]) {
                //if order doesn't match up, swap the values    
                const dataCP = {}
                Object.assign(dataCP, data[i])
                data[i] = data[dublicateIndex]
                data[dublicateIndex] = dataCP
                continue
            } else if (GSRank[i] != GSRank[dublicateIndex]) {
                continue
            }
            if (autonRank[i] > autonRank[dublicateIndex]) {
                //if order doesn't match up, swap the values    
                const dataCP = {}
                Object.assign(dataCP, data[i])
                data[i] = data[dublicateIndex]
                data[dublicateIndex] = dataCP
                continue
            } else if (autonRank[i] != autonRank[dublicateIndex]) {
                continue
            }

            if (stageRank[i] > stageRank[dublicateIndex]) {
                //if order doesn't match up, swap the values    
                const dataCP = {}
                Object.assign(dataCP, data[i])
                data[i] = data[dublicateIndex]
                data[dublicateIndex] = dataCP
                continue
            } else if (stageRank[i] != stageRank[dublicateIndex]) {
                continue
            }

            if (trapRank[i] > trapRank[dublicateIndex]) {
                //if order doesn't match up, swap the values    
                const dataCP = {}
                Object.assign(dataCP, data[i])
                data[i] = data[dublicateIndex]
                data[dublicateIndex] = dataCP
                continue
            }
        }
    }

    let dublicateCount = 0
    for (const [i, v] of Object.entries(ogData)) {
        if (data[i] != v) {
            ++dublicateCount
            consoleLog("found word - " + dublicateCount)
            //consoleLog(data[i], v)
        }
    }

    consoleLog("THIS IS THE DATA", data)

    return res.status(200).send(sortBy(data, totalRank))
})

module.exports = router
