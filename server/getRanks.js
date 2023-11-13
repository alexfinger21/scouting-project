require("dotenv").config()

const request = require("request")
const auth = process.env.TBA_AUTH
const authbase64 = Buffer.from(auth, 'utf8').toString('base64')
const database = require("./database/database.js")
const gameConstants = require('./game.js') 
const { consoleLog } = require("./utility")

const optionsRankings = {
    'method': 'GET',
    //'url': 'https://frc-api.firstinspires.org/v3.0/' + gameConstants.YEAR + '/rankings/'+gameConstants.COMP,
    'url': 'https://www.thebluealliance.com/api/v3/event/' + gameConstants.YEAR + gameConstants.COMP + '/rankings',
    //'url': 'https://www.thebluealliance.com/api/v3/event/2023ohcl/rankings',
    'headers': {
        'X-TBA-Auth-Key': auth,
        'If-Modified-Since': ''
    }
}

const optionsOPRS = {
    'method': 'GET',
    //'url': 'https://frc-api.firstinspires.org/v3.0/' + gameConstants.YEAR + '/rankings/'+gameConstants.COMP,
    'url': 'https://www.thebluealliance.com/api/v3/event/' + gameConstants.YEAR + gameConstants.COMP + '/oprs',
    'headers': {
        'X-TBA-Auth-Key': auth,
        'If-Modified-Since': ''
    }
}

consoleLog(optionsOPRS)
consoleLog(optionsRankings)

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
            const oprData = JSON.parse(response.body)
            
            consoleLog(oprData)

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

                for (let i = 0; i<rankingsData.length; i++) {
                    combinedTeamData[rankingsData[i].team_key.substring(3)] = rankingsData[i]
                    combinedTeamData[rankingsData[i].team_key.substring(3)].opr = oprData["oprs"][rankingsData[i].team_key.substring(3)]
                    combinedTeamData[rankingsData[i].team_key.substring(3)].dpr = oprData["dprs"][rankingsData[i].team_key.substring(3)]
                }

                //consoleLog(database.writeAPIData(combinedTeamData))
                //consoleLog(combinedTeamData)    
                
                database.query(database.deleteAPIData(), (err, res) => {
                    consoleLog(err)
                    //consoleLog(res)
                    database.query(database.writeAPIData(combinedTeamData), (err, res) => {
                        consoleLog(err)
                        //consoleLog(res)
                    })
                })
    
                
                //consoleLog(combinedTeamData)
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

        console.log("GRR")

    })
}

const t = Date.now()

bigLoop()

console.log("Function took " + (Date.now() - t) + " ms")
*/

//returnAPIDATA()

module.exports = {returnAPIDATA}