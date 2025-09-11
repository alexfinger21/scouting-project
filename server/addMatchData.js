import request from "request"
const auth = process.env.TBA_AUTH
import gameConstants from "./game.js"
import { consoleLog } from "./utility.js"
import database from "./database/database.js"
import dotenv from "dotenv"

dotenv.config()

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
            //consoleLog("Response")
            //consoleLog(response.body)
            const matchData = (JSON.parse(response.body))
            //consoleLog(JSON.stringify(matchData, null, "\t")) // makes text look nice
            //consoleLog(matchData)
            const gametype = (gameConstants.GAME_TYPE == "qm" || gameConstants.GAME_TYPE == "Q")? "qm":""
            const matchOutput = {}
            let qNum = 0
            for (let i = 0; i < matchData.length; i++)
            {
                const m = matchData[i]
                const alliancesForBlue = [m.alliances.blue.team_keys[0].substring(3), m.alliances.blue.team_keys[1].substring(3), m.alliances.blue.team_keys[2].substring(3)]
                const alliancesForRed = [m.alliances.red.team_keys[0].substring(3), m.alliances.red.team_keys[1].substring(3), m.alliances.red.team_keys[2].substring(3)]
                const matchNumber =  m.match_number
                //const video = "https://www.youtube.com/watch?v="+m.videos[0].key
        
                if (m.comp_level != gametype)
                {
                    continue
                }
               
                
                matchOutput [String(matchNumber)] =  m
                matchOutput [String(matchNumber)].red = alliancesForRed
                matchOutput [String(matchNumber)].blue = alliancesForBlue
                qNum++
            }
            const qTimes = gameTimes(qNum)
            //consoleLog("hi", qTimes)
            consoleLog("Match output")
            consoleLog(matchOutput)
            consoleLog("Times")
            consoleLog(qTimes)
            database.query(database.deleteMatchDataX(), (err, res) => {
                consoleLog(err)
                //consoleLog(res)
                database.query(database.addMatchData(matchOutput, qTimes), (err, res) => {
                    consoleLog(err)
                    //consoleLog(res)
                })
            })
            resolve(matchData)
         
        })
    })
} 
function gameTimes(matchNum) 
{
    let gameArray = []
    let date = ''
    let time = ''
    for (let segment = 0; segment < gameConstants.sch_constants.length; segment++)
    {
        let sched = gameConstants.sch_constants[segment]
        let dateTime = new Date(sched[2]+'T'+sched[3])
        const offset = dateTime.getTimezoneOffset()*60000
        dateTime.setTime(dateTime.getTime() - offset)  
        for (let match = sched[0]; match <= sched[1]; match++)
        {
            [date, time] = dateTime.toISOString().substring(0, 19).split('T')
            gameArray.push(String(`${date} ${time}`))
            dateTime.setTime(dateTime.getTime() + sched[4]) 
        }
    }
    consoleLog(gameArray)
    return gameArray

}
getData()

export { getData }
