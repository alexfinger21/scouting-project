import database from "../database/database.js"
import express from "express"
import gameConstants from "../game.js"
import socketManager from "../sockets.js"
import { consoleLog } from "../utility.js"
import SQL from "sql-template-strings"

const router = express.Router()

router.get("/", function (req, res) { //only gets used if the url == team-details
    consoleLog("recieved")
    database.query(SQL`SELECT
        distinct team_master_tm_number
    FROM
        teamsixn_scouting_dev.game_matchup
    WHERE
        competition_master_cm_event_code = ${gameConstants.COMP} AND
        gm_game_type = ${gameConstants.GAME_TYPE}
    ORDER BY 
        1`,
    (err, team_results) => {
        team_results = JSON.parse(JSON.stringify(team_results))
        if (!req.query.getTeams) {
            database.query(SQL`select * from teamsixn_scouting_dev.v_alliance_selection_display`, (err, data) => {
                data = JSON.parse(JSON.stringify(data))

                const selectedTeams = []
                for(let i = 0; i < data.length; i++) {
                    if(data[i]) {
                        if(data[i].alliance_captain) {
                            selectedTeams.push(data[i].alliance_captain)
                        }
                        if(data[i].alliance_first) {
                            selectedTeams.push(data[i].alliance_first)
                        }
                        if(data[i].alliance_second) {
                            selectedTeams.push(data[i].alliance_second)
                        }
                    }
                }

                const availableTeams = []
                for(team of team_results) {
                    let found = false
                    for(selected of selectedTeams) {
                        if(team.team_master_tm_number == selected) {
                            found = true
                        }
                    }
                    if(!found) {
                        availableTeams.push(team.team_master_tm_number)
                    }
                }

                res.render("alliance-input", {
                    teams: availableTeams,
                    data: data
                })
            })
        } else {
            return res.status(200).send({teams: team_results.map(e => e.team_master_tm_number).sort((a, b) => a - b)})
        }
    })
})

router.post("/", function (req, res) {
    const body = req.body
    database.query(database.deleteAllianceSelection(body.allianceNum, body.pos), (err, result) => {
        consoleLog(result)
        consoleLog("REMOVED")
        if (body.action == "INSERT") {
            database.query(database.insertAllianceSelection(body.allianceNum, body.pos, body.team), (err, result) => {consoleLog(err); socketManager.emitAllSockets("allianceSelection", "yes")})
            consoleLog("INSERTED")
        } else {
            if (body.pos == 0) {
                database.query(database.deleteAllianceSelection(body.allianceNum, body.pos + 1), (err, result) => {database.query(database.deleteAllianceSelection(body.allianceNum, body.pos + 2), (err, result) => {socketManager.emitAllSockets("allianceSelection", "yes")})})
            } else {
                socketManager.emitAllSockets("allianceSelection", "yes")
            }
        }
    })
    res.send("req recieved")
})

export default router
