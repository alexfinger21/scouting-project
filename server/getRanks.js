import dotenv from "dotenv"

import request from "request"
import database from "./database/database.js"
import gameConstants from "./game.js" 
import { consoleLog } from "./utility.js"

dotenv.config()
const auth = process.env.TBA_AUTH
const authbase64 = Buffer.from(auth, 'utf8').toString('base64')

const optionsRankings = {
    'method': 'GET',
    //'url': 'https://frc-api.firstinspires.org/v3.0/' + gameConstants.YEAR + '/rankings/'+gameConstants.COMP,
    'url': 'https://www.thebluealliance.com/api/v3/event/' + gameConstants.YEAR + (gameConstants.COMP == "ohwr" ? "ohwar" : gameConstants.COMP) + '/rankings',
    //'url': 'https://www.thebluealliance.com/api/v3/event/2023ohcl/rankings',
    'headers': {
        'X-TBA-Auth-Key': auth,
        'If-Modified-Since': ''
    }
}

const optionsOPRS = {
    'method': 'GET',
    //'url': 'https://frc-api.firstinspires.org/v3.0/' + gameConstants.YEAR + '/rankings/'+gameConstants.COMP,
    'url': 'https://www.thebluealliance.com/api/v3/event/' + gameConstants.YEAR + (gameConstants.COMP == "ohwr" ? "ohwar" : gameConstants.COMP) + '/oprs',
    'headers': {
        'X-TBA-Auth-Key': auth,
        'If-Modified-Since': ''
    }
}
/// Function to pull match details using TBA API
const GAME_TYPE_PREFIX = { 'Q': 'qm', 'SF': 'sf', 'F': 'f' }
const eventCode = gameConstants.YEAR + (gameConstants.COMP == "test" ? "week0" : gameConstants.COMP)

function returnMatchData(matchNumber) {
    const matchKey = eventCode + '_' + (GAME_TYPE_PREFIX[gameConstants.GAME_TYPE] ?? gameConstants.GAME_TYPE.toLowerCase()) + matchNumber
    const options = {
        'method': 'GET',
        'url': 'https://www.thebluealliance.com/api/v3/match/' + matchKey,
        'headers': {
            'X-TBA-Auth-Key': auth,
            'If-Modified-Since': ''
        }
    }
    return new Promise((resolve, reject) => {
         if (gameConstants.COMP == "xx") {
             resolve({})
             return
         }
        consoleLog(options)
        request(options, function(error, response) {
            if (error) reject(new Error(error))
            resolve(JSON.parse(response.body))
        })
    })
}

function parseMatchData(matchData) {
    const blue = matchData?.alliances?.blue
    const red = matchData?.alliances?.red
    const blueBreakdown = matchData?.score_breakdown?.blue
    const redBreakdown = matchData?.score_breakdown?.red

    const blue_team_1 = blue?.team_keys?.[0]?.substring(3)
    const blue_team_2 = blue?.team_keys?.[1]?.substring(3)
    const blue_team_3 = blue?.team_keys?.[2]?.substring(3)

    const red_team_1 = red?.team_keys?.[0]?.substring(3)
    const red_team_2 = red?.team_keys?.[1]?.substring(3)
    const red_team_3 = red?.team_keys?.[2]?.substring(3)

    const blue_auto = blueBreakdown?.autoPoints
    const blue_teleop = blueBreakdown?.teleopPoints
    const red_auto = redBreakdown?.autoPoints
    const red_teleop = redBreakdown?.teleopPoints

    consoleLog(blue_auto)

    return {
        blue_team_1, blue_team_2, blue_team_3,
        blue_auto, blue_teleop,
        red_team_1, red_team_2, red_team_3,
        red_auto, red_teleop
    }
}

consoleLog(optionsOPRS)
consoleLog(optionsRankings)
consoleLog("Variables")
console.log(JSON.stringify(parseMatchData(await returnMatchData(5)), null, 2))
const raw = await returnMatchData(5)
console.log(JSON.stringify(raw?.score_breakdown, null, 2))


function printMessage(title, msg) {
    consoleLog("------ " + title + " ------")
    consoleLog(msg)
    consoleLog("------End Message------")
}

printMessage('Base64', authbase64)
// printMessage('Options', options)

let showObj = function () {
    consoleLog("Shape")
    consoleLog(teamData.headers)
    for (let prop in teamData) {
        consoleLog(1)
        consoleLog(prop)
        //   consoleLog(prop)
        //   consoleLog(teamData[prop])
    }
}

function returnAPIDATA() {
    return new Promise((resolve, reject) => {
        if (gameConstants.COMP == "test") {
            resolve({})
            return
        }
        request(optionsOPRS, function(error, response) {
            if (error) throw new Error(error)
            printMessage("Status Code", response.statusCode)
            //consoleLog(response.body)
            const oprData = JSON.parse(response.body)
            
            //consoleLog(oprData)

            for (const [rankings, _] of Object.entries(oprData)) {
                for (const [i, val] of Object.entries(oprData[rankings])) {
                    oprData[rankings][i.substring(3)] = oprData[rankings][i] //remove the first 3 chars in front 'frc'
                    delete oprData[rankings][i]
                }

            }

            request(optionsRankings, function(error, response) {
                const rankingsData = JSON.parse(response.body).rankings
                //consoleLog(rankingsData)
                const combinedTeamData = {}
                if (rankingsData) {

                    for (let i = 0; i<rankingsData.length; i++) {
                        combinedTeamData[rankingsData[i].team_key.substring(3)] = rankingsData[i]
                        combinedTeamData[rankingsData[i].team_key.substring(3)].opr = oprData?.["oprs"]?.[rankingsData[i].team_key.substring(3)]
                        combinedTeamData[rankingsData[i].team_key.substring(3)].dpr = oprData?.["dprs"]?.[rankingsData[i].team_key.substring(3)]
                    }

                    //consoleLog(database.writeAPIData(combinedTeamData))
                    //consoleLog(combinedTeamData)    
                    if (Object.keys(combinedTeamData).length) { 
                        database.query(database.deleteAPIData(), (err, res) => {
                            consoleLog(err)
                            //consoleLog(res)
                            database.query(database.writeAPIData(combinedTeamData), (err, res) => {
                                consoleLog(err)
                                //consoleLog(res)
                            })
                        })
                    }
        
                    
                    //consoleLog(combinedTeamData)
                }
                resolve(combinedTeamData)
            })


            //consoleLog(teamData)
            //printMessage('Type of Data', typeof teamData)
            // teamData.teams.forEach((team) => {
            //   printMessage('Team Info', team)
            // }
            // showObj()
            // printMessage('Length of Teams array', team_data.teams.teamNumber)
            //printMessage('Data', teamData)
            //consoleLog(teamData.Rankings[0].teamNumber)
        })
    })
}

/*
function bigLoop() {
    return Promise.resolve().then(() => {
        for (let i = 0; i<1000000000; i++) {
        
        }

    })
}

const t = Date.now()

bigLoop()

console.log("Function took " + (Date.now() - t) + " ms")
*/

//returnAPIDATA()

export { returnAPIDATA, returnMatchData, parseMatchData }
