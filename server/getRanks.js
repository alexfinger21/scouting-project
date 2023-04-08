
require("dotenv").config()

const request = require("request")
const auth = process.env.TBA_AUTH
const authbase64 = Buffer.from(auth, 'utf8').toString('base64')
const database = require("./database/database.js")
const gameConstants = require('./game.js') 

const optionsRankings = {
    'method': 'GET',
    //'url': 'https://frc-api.firstinspires.org/v3.0/' + gameConstants.YEAR + '/rankings/'+gameConstants.COMP,
    //'url': 'https://www.thebluealliance.com/api/v3/event/' + gameConstants.YEAR + gameConstants.COMP + '/rankings',
    'url': 'https://www.thebluealliance.com/api/v3/event/2023ohcl/rankings',
    'headers': {
        'X-TBA-Auth-Key': auth,
        'If-Modified-Since': ''
    }
}

const optionsOPRS = {
    'method': 'GET',
    //'url': 'https://frc-api.firstinspires.org/v3.0/' + gameConstants.YEAR + '/rankings/'+gameConstants.COMP,
    'url': 'https://www.thebluealliance.com/api/v3/event/2023ohcl/oprs',
    'headers': {
        'X-TBA-Auth-Key': auth,
        'If-Modified-Since': ''
    }
}

function printMessage(title, msg) {
    console.log("------ " + title + " ------")
    console.log(msg)
    console.log("------End Message------")
}

printMessage('Base64', authbase64)
// printMessage('Options', options)

let showObj = function () {
    console.log("Shape")
    console.log(teamData.headers)
    for (let prop in teamData) {
        console.log(1)
        console.log(prop)
        //   console.log(prop)
        //   console.log(teamData[prop])
    }
}

function returnAPIDATA() {
    return new Promise(resolve => {
        request(optionsOPRS, function(error, response) {
            if (error) throw new Error(error)
            printMessage("Status Code", response.statusCode)
            const oprData = JSON.parse(response.body)
            
            //console.log(oprData)

            for (const [rankings, _] of Object.entries(oprData)) {
                for (const [i, val] of Object.entries(oprData[rankings])) {
                    oprData[rankings][i.substring(3)] = oprData[rankings][i] //remove the first 3 chars in front 'frc'
                    delete oprData[rankings][i]
                }

            }

            request(optionsRankings, function(error, response) {
                const rankingsData = JSON.parse(response.body).rankings
                //console.log(rankingsData)
                const combinedTeamData = {}

                for (let i = 0; i<rankingsData.length; i++) {
                    combinedTeamData[rankingsData[i].team_key.substring(3)] = rankingsData[i]
                    combinedTeamData[rankingsData[i].team_key.substring(3)].opr = oprData["oprs"][rankingsData[i].team_key.substring(3)]
                    combinedTeamData[rankingsData[i].team_key.substring(3)].dpr = oprData["dprs"][rankingsData[i].team_key.substring(3)]
                }

                console.log(database.writeAPIData(combinedTeamData))
                //console.log(combinedTeamData)    
                
                database.query(database.deleteAPIData(), (err, res) => {
                    console.log(err)
                    console.log(res)
                    database.query(database.writeAPIData(combinedTeamData), (err, res) => {
                        console.log(err)
                        console.log(res)
                    })
                })
    
                
    
                resolve(combinedTeamData)
            })


            //console.log(teamData)
            //printMessage('Type of Data', typeof teamData)
            // teamData.teams.forEach((team) => {
            //   printMessage('Team Info', team)
            // }
            // showObj()
            // printMessage('Length of Teams array', team_data.teams.teamNumber)
            //printMessage('Data', teamData)
            //console.log(teamData.Rankings[0].teamNumber)
        })
    })
}


returnAPIDATA().then(res => {
    //console.log(res.Rankings.map(e => e.rank))
})

module.exports = {returnAPIDATA}