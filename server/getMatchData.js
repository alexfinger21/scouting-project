import dotenv from "dotenv"

import request from "request"
import database from "./database/database.js"
import gameConstants from "./game.js" 
import {consoleLog} from "./utility.js"
import { argv0 } from "process"

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

function parseClimbLevel(climbLevel) {
	if(climbLevel == "None") {
		return 0 
	}

	const level = climbLevel.replace("Level", "")

	return level != "" ? parseInt(level) : 0
}

function parseAllianceData(data, weights, teamKeys) {

	const teams = teamKeys.map(i => i.slice(3))
	const endgameClimbLevels = [
		data.endGameTowerRobot1,
		data.endGameTowerRobot2, 
		data.endGameTowerRobot3
	].map(climbLevel => parseClimbLevel(climbLevel))
 
	const autoClimbLevels = [
		data.autoTowerRobot1,
		data.autoTowerRobot2, 
		data.autoTowerRobot3
	].map(climbLevel => parseClimbLevel(climbLevel))

	return {
		teams: teams,
		autonWeights: teams.map(i => weights[i]?.autonWeight ?? 1),
		teleopWeights: teams.map(i => weights[i]?.teleopWeight ?? 1),
		teleopFuel: data.hubScore.teleopPoints,
		autoFuel: data.hubScore.autoPoints,
		endgameClimbLevels: endgameClimbLevels,
		autoClimbLevels: autoClimbLevels,		
	}
}

function parseMatchData(matchDataPacket, OPRWeights) {
	const data = []
	const matchData = JSON.parse(JSON.stringify(matchDataPacket))
	for(const match of matchData) {
		if(match.comp_level != "qm" || match.score_breakdown == null) { //not a qualification match or not scored yet
			continue
		}
		data.push(parseAllianceData(match.score_breakdown.blue, OPRWeights, match.alliances.blue.team_keys))
		data.push(parseAllianceData(match.score_breakdown.red, OPRWeights, match.alliances.red.team_keys))
	}
	return data
}

function parseOPRWeights(weightsPacket) {
	const OPRWeights = JSON.parse(JSON.stringify(weightsPacket))[1] //stringify returns [null, [data]]

	return OPRWeights.reduce((accumulator, currentValue) => {
		accumulator[currentValue.team_master_tm_number] = {
			autonWeight: currentValue.auton_time_weight,
			teleopWeight: currentValue.teleop_time_weight / 210000, //fraction of total time spent cycling or stockpiling
		}
		return accumulator
	}, {})
}

function getMatchData() {
	const weightsPromise = database.query(database.getOPRWeights())
	const matchDataPromise = fetchMatchData(5)
	Promise.all([weightsPromise, matchDataPromise]).then(([weightsPacket, matchDataPacket]) => {
		const OPRWeights = parseOPRWeights(weightsPacket)
		const data = parseMatchData(matchDataPacket, OPRWeights)
		console.log("PARSED DATA", data)
	})
}


export default {
	getMatchData()
