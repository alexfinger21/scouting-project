import express from "express"
const router = express.Router()
import database from "../database/database.js"
import { checkAdmin } from "../utility.js"
import {getMatchVideos } from "../TBAAPIData.js"
import socketManager from "../sockets.js"
import { consoleLog } from "../utility.js"
import SQL from "sql-template-strings"

import dotenv from "dotenv"
dotenv.config()

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
process.env.lastPlayedMatch = 1

function addZero(num) {
    return num < 10 ? "0" + String(num) : String(num)
}

const auth = process.env.TBA_AUTH

const readTBA = async (url) => {
    const response = await fetch("https://www.thebluealliance.com/api/v3" + url, {
        headers: { "X-TBA-Auth-Key": auth },
    });

    if (response.status === 200) {
        return response.json();
    }

    throw new Error("TBA Error: " + response.status);
};

const getAlliances = async (eventId) => {
    const rawAlliances = await readTBA(`/event/${eventId}/alliances`);
    consoleLog("\n\nGET ALLIANCE DATA TEST")
    consoleLog(JSON.stringify(rawAlliances, null, 2))
    const alliances = rawAlliances?.map((alliance, i) => {
        //console.log(alliance)
        return {
            rank: i + 1,
            teams: alliance?.picks?.map((pick) => parseInt(pick?.slice(3))),
            //record: ${ alliance?.status?.record?.wins } - ${ alliance?.status?.record?.losses } - ${ alliance?.status?.record?.ties },
            //status: alliance?.status?.status,
        }
    });

    return alliances;
};

router.get("/", async function (req, res) {
    //getAlliances("2023ohcl") //include for testing purposes

    consoleLog("GET request for match listing")
    consoleLog("Get collected data: " + req.query.getCollectedData)
    if ("" + req.query?.getCollectedData == "true") {
        database.query(database.getCollectedData(req.query.matchNumber), (err, results) => {
            //consoleLog("COLLECTED DATA RESULTS")
            //consoleLog(results)
            res.status(200).send(JSON.stringify(results))
        })
    } else if (req.query?.["get-videos"]) {
        let matchVideos
        
        try {
            matchVideos = await getMatchVideos()
        }
        catch {
            matchVideos = []
        }

        return res.send(matchVideos)
    } else {
        const tmr = Date.now()
        const [err, results] = await database.query(database.getTeams())
        //get isAdmin
        const isAdmin = await checkAdmin(req)
        consoleLog(results)

        //get running game
        let runningMatch = -1
        const [err1, runningMatchResults] = await database.query(SQL`select * from teamsixn_scouting_dev.current_game;`)

        if (runningMatchResults.length > 0) {
            runningMatch = runningMatchResults[0].cg_gm_number
            process.env.lastPlayedMatch = runningMatchResults[0].cg_gm_number
        }
        consoleLog("TIME", Date.now() - tmr)

        //get teams 
        const teams = {}

        for (let i = 0; i < results.length; i++) {
            const currentTeam = results[i]

            teams[i] = currentTeam

            const date = new Date(teams[i].gm_timestamp)
            const month = months[date.getUTCMonth()]
            const day = date.getDate()
            const h = addZero(date.getHours())
            const m = addZero(date.getMinutes())
            teams[i].time = month + " " + day + ", " + h + ":" + m

            //consoleLog(teams[i])
        }

        teams.length = Object.keys(teams).length


        consoleLog("TIME", Date.now() - tmr)
        consoleLog("Rendering match listing")
        //consoleLog(matchVideos)

        res.render("match-listing", {
            teams: teams,
            isAdmin: isAdmin,
            runningMatch: runningMatch,
            //matchVideos: matchVideos,
            lastPlayedMatch: process.env.lastPlayedMatch
        })
    }
})

router.post("/", function (req, res) {
    const body = req.body
    if (body.stop_match == true) { //stop match
        consoleLog("Got here ")
        database.query(SQL`delete from teamsixn_scouting_dev.current_game 
        where cg_sm_year > 0;`, (err, results) => {
            consoleLog(err)
            socketManager.emitAllSockets("stopMatch", body.gm_number)
            res.send("match stopped")
        })

        database.query(database.clearMatchStrategyTemp(), (err, results) => {
            console.log(err)
            database.query(database.saveMatchStrategy(), (err, results) => {
                consoleLog(err)
                consoleLog("DID it")
                //consoleLog(results)
            })
            consoleLog(err)
            //consoleLog(results)
        })
    }
    else { //attempt to start match
        database.query(SQL`select * from teamsixn_scouting_dev.current_game;`, (err, results) => { //match is already running
            if (results.length > 0) {
                res.status(200).send({ response: false, matchNumber: results[0].cg_gm_number })
            }
            else { //start new match
                database.query(SQL`insert into teamsixn_scouting_dev.current_game 
                (cg_sm_year, cg_cm_event_code, cg_gm_game_type, cg_gm_number)
                select ${body.year}, ${body.event_code}, ${body.gm_type}, ${body.gm_number};`, (err, results) => {
                    consoleLog(err)
                })

                process.env.lastPlayedMatch = body.gm_number

                socketManager.emitAllSockets("changeMatch", body.gm_number)

                res.status(200).send({ response: true })
            }
        })
    }
})

export default router
