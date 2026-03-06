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
const eventCode = gameConstants.YEAR + (gameConstants.COMP == "test" ? "tuis" : gameConstants.COMP)

function fetchMatchData() {
    const options = {
        'method': 'GET',
        'url': 'https://www.thebluealliance.com/api/v3/event/' + eventCode + '/matches',
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

function parseAllianceData(data, weights, teamKeys) {

	const teams = teamKeys.map(i => i.slice(3))

	return {
		teams: teams,
		autonWeights: teams.map(i => weights[i].autonWeight),
		teleopWeights: teams.map(i => weights[i].teleopWeight),
		teleopFuel: data.hubScore.totalTeleopPoints,
		autoFuel: data.hubScore.autoPoints,
		endgameClimbLevel: [data.endgameTowerRobot1, data.endgameTowerRobot2, data.endgameTowerRobot3],
		autonClimbLevel: [data.autoTowerRobot1, data.autoTowerRobot2, data.autoTowerRobot3],
		
	}
}

function parseMatchData(matchDataPacket, OPRWeights) {
	const data = []
	const matchData = JSON.parse(JSON.stringify(matchDataPacket))
	for(const match of matchData) {
		if(match.comp_level != "qm") { //qualification match
			continue
		}
		data.push(parseAllianceData(matchData.score_breakdown.blue), OPRWeights, matchData.alliances.red.team_keys)
		data.push(parseAllianceData(matchData.score_breakdown.red, OPRWeights, matchData.alliances.red.team_keys))
	}
}

function parseOPRWeights(weightsPacket) {
	const OPRWeights = JSON.parse(JSON.stringify(weightsPacket))

	console.log("OPR WEIGHTS", weightsPacket)
	return OPRWeights.reduce((accumulator, currentValue) => {
		accumulator[currentValue.team_master_tm_number] = {
			autonWeight: currentValue.auton_time_weight,
			teleopWeight: currentValue.teleop_time_weight / 210000, //fraction of total time spent cycling or stockpiling
		}
		return accumulator
	}, {})
}


const weightsPromise = database.query(database.getOPRWeights())
const matchDataPromise = fetchMatchData(5)
Promise.all([weightsPromise, matchDataPromise]).then(([weightsPacket, matchDataPacket]) => {
	const OPRWeights = parseOPRWeights(weightsPacket)
	const data = parseMatchData(matchDataPacket, OPRWeights)
	console.log("PARSED DATA", data)
})



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

export {parseMatchData }
