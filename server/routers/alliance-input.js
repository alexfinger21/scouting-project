const database = require("../database/database.js")
const express = require("express")
const gameConstants = require("../game.js")
const game = require("../game.js")
const router = express.Router()

router.get("/", function (req, res) { //only gets used if the url == team-details
    console.log("recieved")
    database.query(`SELECT
        distinct team_master_tm_number
    FROM
        teamsixn_scouting_dev.game_matchup
    WHERE
        competition_master_cm_event_code = "${gameConstants.COMP}" AND
        gm_game_type = "${gameConstants.GAME_TYPE}"
    ORDER BY 
        1`,
    (err, team_results) => {
        team_results = JSON.parse(JSON.stringify(team_results))
        if (!req.query.getTeams) {
            database.query(`select * from teamsixn_scouting_dev.v_alliance_selection_display`, (err, data) => {
                data = JSON.parse(JSON.stringify(data))
                console.log("DATA:")
                console.log(data)

                let selectedTeams = []
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
                console.log("SELECTED TEAMS")
                console.log(selectedTeams)
                let availableTeams = []
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
                console.log("AVAILABLE TEAMS")
                console.log(availableTeams)

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
    console.log("BODY: ")
    console.log(body)
    database.query(database.deleteAllianceSelection(body.allianceNum, body.pos), (err, result) => {
        console.log(err)
        console.log(result)
        console.log("REMOVED")
        if (body.action == "INSERT") {
            database.query(database.insertAllianceSelection(body.allianceNum, body.pos, body.team), (err, result) => {console.log(err)})
            console.log("INSERTED")
        }
    })
    res.send("req recieved")
})

module.exports = router