import dotenv from "dotenv"
import request from "request"
import database from "./database/database.js"
import gameConstants from "./game.js" 
import { consoleLog } from "./utility.js"
import { Matrix, solve } from 'ml-matrix'
import {getMatchData, getLatestMatchWithData} from "./getMatchData.js"

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

function getCumWeights(matches, weightProperty) {
    const totalWeights = {}

    for (const match of matches) {
        let t_idx = 0
        for (const t of match.red.teams) {
            //console.log(t, alliances[m_idx])
            if (match.red[weightProperty][t_idx]) {
                if (!totalWeights[t]) {
                    totalWeights[t] = [match.red[weightProperty][t_idx], 1]
                } else {
                    totalWeights[t][0] += match.red[weightProperty][t_idx]
                    ++totalWeights[t][1] 
                }
            }

            ++t_idx
        }

        t_idx = 0
        for (const t of match.blue.teams) {
            if (match.blue[weightProperty][t_idx]) {
                if (!totalWeights[t]) {
                    totalWeights[t] = [match.blue[weightProperty][t_idx], 1]
                } else {
                    totalWeights[t][0] += match.blue[weightProperty][t_idx]
                    ++totalWeights[t][1] 
                }
            }

            ++t_idx
        }

    }

    const cumWeights = {}

    for (const team in totalWeights) {
        cumWeights[team] = totalWeights[team][0]/totalWeights[team][1]
    }

    return cumWeights
}

function calculateOpr(matches, scoreProperty, weightProperty) {
    const alliances = new Array(matches.length * 2)
    const teams = new Set()
    const scores = new Array(alliances.length)
    const cumWeights = getCumWeights(matches, weightProperty)

    let m_idx = 0;
    for (const match of matches) {
        [...match.red.teams, ...match.blue.teams].forEach(t => {
            teams.add(t)
        })

        scores[m_idx] = [Math.pow(match.red[scoreProperty], 2)] 
        scores[m_idx + 1] = [Math.pow(match.blue[scoreProperty], 2)]

        m_idx += 2
    }

    const teamArr = Array.from(teams)
    const teamIdx = {}

    for (let i = 0; i<teams.size; ++i) {
        teamIdx[teamArr[i]] = i
    }

    //console.log(teamIdx)

    for (let idx = 0; idx<alliances.length; ++idx) {
        alliances[idx] = new Array(teamArr.length).fill(0)
    }

    m_idx = 0;
    for (const match of matches) {
        let t_idx = 0

        for (const t of match.red.teams) {
            alliances[m_idx][teamIdx[t]] = match.red[weightProperty][t_idx] 
                ? match.red[weightProperty][t_idx] 
                : (cumWeights[t] ?? 0.5)

            ++t_idx
        }

        t_idx = 0

        for (const t of match.blue.teams) {
            alliances[m_idx + 1][teamIdx[t]] = match.blue[weightProperty][t_idx] 
                ? match.blue[weightProperty][t_idx] 
                : ( cumWeights[t] ?? 0.5)

            ++t_idx
        }

        m_idx += 2
    }

    const AMatrix = new Matrix(alliances)
    const bMatrix = new Matrix(scores)

    const oprMatrix = solve(AMatrix, bMatrix)
    const oprMap = {} 

    for (let i = 0; i<teamArr.length; ++i) {
        const oprVal = oprMatrix.get(i, 0)  
        const oprAdjusted = oprVal > 0 
            ? Math.sqrt(oprVal) 
            : -Math.sqrt(Math.abs(oprVal))

        oprMap[teamArr[i]] = oprAdjusted 
    }

    return oprMap
}

function calculateDpr(matches, opr, scoreProperty, weightProperty) {
    const alliances = new Array(matches.length * 2)
    const teams = new Set()
    const scores = new Array(alliances.length)
    const cumWeights = getCumWeights(matches, weightProperty)


    let m_idx = 0;
    for (const match of matches) {
        [...match.red.teams, ...match.blue.teams].forEach(t => {
            teams.add(t)
        })

        /*
        console.log(match.red[scoreProperty], match.red.teams.reduce(
            (a, t) => {
                console.log(t)
                return a + opr[t]
            }, 0))
        console.log("-------------")
        */


        scores[m_idx] = [match.blue[scoreProperty] - match.blue.teams.reduce(
            (a, t) => {
                return a + opr[t]
            }, 0)]

        scores[m_idx+1] = [match.red[scoreProperty] - match.red.teams.reduce(
            (a, t) => {
                return a + opr[t]
            }, 0)]

        m_idx += 2
    }

    const teamArr = Array.from(teams)
    const teamIdx = {}

    for (let i = 0; i<teams.size; ++i) {
        teamIdx[teamArr[i]] = i
    }

    for (let idx = 0; idx<alliances.length; ++idx) {
        alliances[idx] = new Array(teamArr.length).fill(0)
    }

    m_idx = 0;
    for (const match of matches) {
        let t_idx = 0

        for (const t of match.red.teams) {
            alliances[m_idx][teamIdx[t]] = match.red[weightProperty][t_idx] 
                ? match.red[weightProperty][t_idx] 
                : (cumWeights[t] ?? 0.5)
            ++t_idx
        }

        t_idx = 0

        for (const t of match.blue.teams) {
            alliances[m_idx+1][teamIdx[t]] = match.blue[weightProperty][t_idx] 
                ? match.blue[weightProperty][t_idx] 
                : (cumWeights[t] ?? 0.5)
            ++t_idx
        }

        m_idx += 2
    }

    const AMatrix = new Matrix(alliances)
    const bMatrix = new Matrix(scores)

    const dprMatrix = solve(AMatrix, bMatrix)
    const dprMap = {} 

    for (let i = 0; i<teamArr.length; ++i) {
        const adjustedDpr = -1 * dprMatrix.get(i, 0) * (
                (!cumWeights[teamArr[i]] || cumWeights[teamArr[i]] == 1)
                ? 0 
                : cumWeights[teamArr[i]]
            )

        dprMap[teamArr[i]] = adjustedDpr 
    }

    return dprMap
}

function postProcessOpr(opr) {
    return Object.entries(opr).sort((a, b) => 
        b[1] - a[1]
    ).map(val => {
        return [val[0], val[1] > 0 
            ? Math.sqrt(val[1]) 
            : -Math.sqrt(Math.abs(val[1]))]
    })

}

function returnAPIRankings() {
    return new Promise((resolve, reject) => {
        if (gameConstants.COMP == "test") {
            resolve({})
            return
        }
        request(optionsOPRS, function(error, response) {
            if (error) throw new Error(error)
            // printMessage("Status Code", response.statusCode)
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

                    //consoleLog(database.writeAPIRankings(combinedTeamData))
                    //consoleLog(combinedTeamData)    
                    if (Object.keys(combinedTeamData).length) { 
                        database.query(database.deleteAPIRankings(), (err, res) => {
                            consoleLog(err)
                            //consoleLog(res)
                            database.query(database.writeApiRankings(combinedTeamData), (err, res) => {
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

async function writeBlueAllianceData(matchData) {
    const startingIndex = await getLatestMatchWithData()
    const [err, res] = await database.query(database.updateGameDetails(matchData, startingIndex))
    
    if (err) {
        consoleLog("Error writing blue alliance data: ", err)
    }
    else {
        consoleLog("Saved blue alliance data successfully")
    }
}


async function syncServer() {
    const data = await getMatchData()
    console.dir(data, { depth: null, colors: true })
    

    writeBlueAllianceData(data)

    const rankings = await returnAPIRankings()
    try {
        const teleopOpr = calculateOpr(data, "teleopFuel", "teleopWeights")

        const autonOpr = calculateOpr(data, "autonFuel", "autonWeights")
        console.log(teleopOpr)

        const dpr = calculateDpr(data, teleopOpr, "teleopFuel", "defenseWeights") 
        console.log(dpr)
        /*
        console.log("teleop opr", teleopOpr)
        console.log("auton opr", autonOpr)
        */
        //console.log("dpr", dpr)
        /*database.query(database.deleteApiCalc(), (err, res) => {
            if(err) {
                console.log(err)
                return
            }
            else {
                database.query(database.writeApiCalc(teleopOpr, autonOpr), (err, res => {
                    if(err) {
                        console.log(err);
                    }
                }))
            }
        }) */
    } catch(err) {
        console.log("error saving opr:", err)
    }

    //reset tmp match strategy

    database.query(database.clearMatchStrategyTemp(), (err, results) => {
        console.log(err)
        database.query(database.saveMatchStrategy(), (err, results) => {
            consoleLog(err)
            consoleLog("DID it")
            //consoleLog(results)
        })
        consoleLog(err)
    }) 
}

syncServer()

export { returnAPIRankings, syncServer }
