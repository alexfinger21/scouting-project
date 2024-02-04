require("dotenv").config()

//const csv = require('fast-csv')
const request = require("request")
const auth = process.env.TBA_AUTH
const gameConstants = require("./game.js")
const { consoleLog, parseData } = require("./utility.js")
const { default: jsPDF } = require("jspdf")
const { json } = require("express")
const database = require("./database/database.js")

const matchList = {
    "method": "GET",
    "url":  'https://www.thebluealliance.com/api/v3/event/' + gameConstants.YEAR + gameConstants.COMP + '/matches/simple',
    'headers': {
        'X-TBA-Auth-Key': auth,
       'If-Modified-Since': ''
    }
}

function getData () {
    return new Promise((resolve, reject) => {
        if(gameConstants.COMP == "test")
        {
            resolve({})
            consoleLog('gameConstants.COMP == "test"')
        }
        request(matchList, function(error, response) {
            if (error) throw new Error(error)
            consoleLog("Status Code", response.statusCode)
            const matchData = (JSON.parse(response.body))
            //consoleLog(JSON.stringify(matchData, null, "\t")) // makes text look nice
            //consoleLog(matchData)

            const matchOutput = {}
            
            for (let i = 0; i < matchData.length; i++)
            {
                const m = matchData[i]
                const alliancesForBlue = [m.alliances.blue.team_keys[0].substring(3), m.alliances.blue.team_keys[1].substring(3), m.alliances.blue.team_keys[2].substring(3)]
                const alliancesForRed = [m.alliances.red.team_keys[0].substring(3), m.alliances.red.team_keys[1].substring(3), m.alliances.red.team_keys[2].substring(3)]
                const matchNumber =  m.match_number
                // let theUtcTime = new Date((m.predicted_time*1000))
                // let time = theUtcTime.toUTCString()
                // Time not working right now
                if (m.comp_level != gameConstants.GAME_TYPE)
                {
                    continue
                }
                //consoleLog(/*'time ', time,*/ 'blue ', alliancesForBlue, ' red ', alliancesForRed, matchNumber)
               
                
                matchOutput [String(matchNumber)] =  m
                matchOutput [String(matchNumber)].red = alliancesForRed
                matchOutput [String(matchNumber)].blue = alliancesForBlue
            }
            database.query(database.deleteMatchDataX(), (err, res) => {
                consoleLog(err)
                //consoleLog(res)
                database.query(database.addMatchData(matchOutput), (err, res) => {
                    consoleLog(err)
                    //consoleLog(res)
                })
            })
            resolve(matchData)
         
        })
    })
} 
getData()
module.exports = {getData}