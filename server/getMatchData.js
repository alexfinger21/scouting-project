import dotenv from "dotenv"

import request from "request"
import database from "./database/database.js"
import gameConstants from "./game.js" 
import {consoleLog} from "./utility.js"
import { argv0 } from "process"

dotenv.config()
const auth = process.env.TBA_AUTH
const authbase64 = Buffer.from(auth, 'utf8').toString('base64')


/// Function to pull match details using TBA API
const eventCode = gameConstants.YEAR + (gameConstants.COMP == "test" ? "tuis" : gameConstants.COMP)

// This function finds the latest match in the database with blue alliance data loaded for it
async function getLatestMatchWithData() {
  let [err, res] = await database.query(database.getLatestMatchWithData())
  if(err) {
    console.log("Error getting latest match with blue alliance data:", err)
    return 0 
  }
  res = JSON.parse(JSON.stringify(res))
  if(res.length == 0) {
    return 0 
  }
  const latestMatch = res[0].game_matchup_gm_number
  return latestMatch
}

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

function parseAllianceData(matchNumber, data, weights, teamKeys) {

  const teams = teamKeys.map(i => i.slice(3))
  const endgameClimbLevels = [
    data.endGameTowerRobot1,
    data.endGameTowerRobot2, 
    data.endGameTowerRobot3
  ].map(climbLevel => parseClimbLevel(climbLevel))

  const autonClimbLevels = [
    data.autoTowerRobot1,
    data.autoTowerRobot2, 
    data.autoTowerRobot3
  ].map(climbLevel => parseClimbLevel(climbLevel))

  return {
    teams: teams,
    autonWeights: teams.map(i => weights[matchNumber]?.[i]?.autonWeight ?? 1),
    teleopWeights: teams.map(i => weights[matchNumber]?.[i]?.teleopWeight ?? 1),
    defenseWeights: teams.map(i => weights[matchNumber]?.[i]?.defenseWeight ?? 1),
    teleopFuel: data.hubScore.teleopPoints,
    autonFuel: data.hubScore.autoPoints,
    endgameClimbLevels: endgameClimbLevels,
    autonClimbLevels: autonClimbLevels,		
  }
}

function parseMatchData(matchDataPacket, OPRWeights) {
  const data = []
  const matchData = JSON.parse(JSON.stringify(matchDataPacket))
    .sort( (a, b) => a.match_number - b.match_number )

  console.log(OPRWeights)
  for(const match of matchData) {
    if(match.comp_level != "qm" || match.score_breakdown == null) { //not a qualification match or not scored yet
      continue
    }
    data.push({
      blue: parseAllianceData(match.match_number, match.score_breakdown.blue, OPRWeights, match.alliances.blue.team_keys),
      red: parseAllianceData(match.match_number, match.score_breakdown.red, OPRWeights, match.alliances.red.team_keys),
    })
  }
  return data
}

function parseOPRWeights(weightsPacket) {
  const OPRWeights = JSON.parse(JSON.stringify(weightsPacket))[1] //stringify returns [null, [data]]
  return OPRWeights.reduce((accumulator, currentValue) => {
    const matchNumber = currentValue.game_matchup_gm_number
    if(accumulator[matchNumber] == null) {
      accumulator[matchNumber] = {}
    }
    accumulator[matchNumber][currentValue.team_master_tm_number] = {
      autonWeight: currentValue.auton_time_weight,
      teleopWeight: currentValue.teleop_time_weight / 220000, //fraction of total time spent cycling or stockpiling
      defenseWeight: currentValue.defense_time_weight / 220000, //fraction of total time spent defending 
    }
    return accumulator
  }, [])
}

async function getMatchData() {
  const weightsPromise = database.query(database.getOPRWeights())
  const matchDataPromise = fetchMatchData()
  const [weightsPacket, matchDataPacket] = await Promise.all([weightsPromise, matchDataPromise])
  const OPRWeights = parseOPRWeights(weightsPacket)
  const data = parseMatchData(matchDataPacket, OPRWeights)
  return data 
}


export {getMatchData, getLatestMatchWithData}

