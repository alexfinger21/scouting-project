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
    "url":  'https://www.thebluealliance.com/api/v3/event/' + gameConstants.YEAR + gameConstants.COMP + '/matches',
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

            const jsonData = (JSON.parse(response.body))
            //consoleLog(JSON.stringify(matchData, null, "\t")) // makes text look nice

            resolve(jsonData)
        })
    })
} 


//gets all videos for all qual matches for specificTeam
//otherwise it gets all the videos sorted by match number
async function getMatchVideos(specificTeam=false)
{
    const matchData = await getData()
    const gametype = (gameConstants.GAME_TYPE == "qm" || gameConstants.GAME_TYPE == "Q")? "qm":""        
    const matchVideos = []

    for (let i = 0; i < matchData.length; i++)
    {
        const m = matchData[i]

        if (m.comp_level != gametype)
        {
            continue
        }
       
        // const scoreBreakdown = m.score_breakdown
        // const scoreForBlue = scoreBreakdown.blue.teleopTotalNotePoints
        // const scoreForRed = scoreBreakdown.red.teleopTotalNotePoints

        const matchNumber =  m.match_number
        const alliancesForBlue = [m.alliances.blue.team_keys[0].substring(3), m.alliances.blue.team_keys[1].substring(3), m.alliances.blue.team_keys[2].substring(3)]
        const alliancesForRed = [m.alliances.red.team_keys[0].substring(3), m.alliances.red.team_keys[1].substring(3), m.alliances.red.team_keys[2].substring(3)]
        const videoKey = m.videos[0].key
        const video = "https://www.youtube.com/watch?v="+m.videos[0].key 
       

        if (videoKey)
        {
            if (specificTeam)
            {
                for (let f = 0; f <= 2; f++)
                {
                    if (specificTeam == alliancesForBlue[f]|| specificTeam == alliancesForRed[f])
                    {
                        matchVideos.push([matchNumber, video])
                        break
                    }
                }
            }
            else
            {
                matchVideos.push([matchNumber, video])
            }
        }
        else
        {
            matchVideos.push([matchNumber, "https://www.youtube.com/watch?v=dQw4w9WgXcQ"])
        }
    }

    matchVideos.sort(function(a, b){return a[0] - b[0]})

    return matchVideos
}

module.exports = {getMatchVideos, getData}
