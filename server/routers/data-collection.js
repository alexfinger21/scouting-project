const database = require("../database/database.js")
const express = require("express")
const { checkAdmin } = require("../utility")
const gameConstants = require("../game.js")
const { consoleLog } = require("../utility")
const { data, error } = require("jquery")

const router = express.Router()

router.get("/", async function (req, res) { //only gets used if the url == data-collection
    const isAdmin = await checkAdmin(req)
    const username = req.cookies["username"]
    consoleLog("SELECTED PAGE " + req.query.selectedPage)
    const selectedPage = req.query.selectedPage || "scouting-page"
    const match = req.query.match ? req.query.match : process.env.lastPlayedMatch

    let runningMatch = 1;
    database.query(`select * from teamsixn_scouting_dev.current_game;`, (err, runningMatchResults) => {
        if (runningMatchResults[0]) { //if a match is running
            runningMatch = runningMatchResults[0].cg_gm_number
        }
        database.query(database.getAssignedTeam(username), (err, assignment) => {
            assignment = JSON.parse(JSON.stringify(assignment))[0] //convert rowDataPacket to object
            if (assignment != undefined) { //user is assigned a team
                //add team color
                if (assignment.gm_alliance == "B") {
                    assignment.team_color = "blue"
                }
                else {
                    assignment.team_color = "red"
                }
                //add match display
                let teamName = assignment.team_color.substring(0, 1).toUpperCase() + assignment.team_color.substring(1)
                assignment.match_display = "Match " + assignment.gm_game_type + assignment.cg_gm_number + " - "
                    + teamName + " " + assignment.gm_alliance_position
                consoleLog(assignment)
            }
            
            database.query(database.getGameNumbers(), (err, results) => {
                database.query(database.getMatchData(match), (err, matchup) => {
                    matchup = JSON.parse(JSON.stringify(matchup)) //convert RowDataPacket to object
                    consoleLog("MATCH:")
                    consoleLog(match)
                    //consoleLog("\nMATCH DATA: ")
                    //consoleLog(matchup)

                    res.render("data-collection", {
                        matches: JSON.parse(JSON.stringify(results)),
                        lastMatch: match,
                        runningMatch: runningMatch,
                        assignment: assignment,
                        isAdmin: isAdmin,
                        matchup: matchup,
                        selectedPage: selectedPage
                    })
                })
            })
        })
    })
})

router.post("/", function (req, res) {
    const body = req.body
    body.username = req.cookies["username"]
    const user_id = req.cookies["user_id"]

    consoleLog(body)

    if (body.type == "scouting") {
        database.query(database.deleteData(body), (err, results) => {
            consoleLog(err)
            consoleLog(results)
            consoleLog(user_id)
            
            database.query(database.saveData(body), (err, results) => {
                consoleLog(err)
                consoleLog(results)
                
                database.query(`update teamsixn_scouting_dev.game_details gd
                set gd.gd_score = gd_score(gd.game_element_ge_key, gd.gd_value)
                WHERE 
                    gd.frc_season_master_sm_year = ${gameConstants.YEAR} and
                    gd.competition_master_cm_event_code = '${gameConstants.COMP}' and 
                    gd.game_matchup_gm_game_type = '${gameConstants.GAME_TYPE}' and 
                    gd.game_matchup_gm_number = ${body.matchNumber};`, (err, results) => {
                    consoleLog(err)
                    consoleLog(results)
                    if (body.comments) {
                        database.query(database.saveComment(body.comments, body.username, body.matchNumber, body.alliance, body.position), (err, results) => {
                            consoleLog(err)
                            consoleLog(results)
                        })
                    }
                })
            })
        })
    } else if (body.type == "comments") {
        consoleLog("comments:")
        consoleLog(body.comments)
        for (const [team, comment] of Object.entries(body.comments)) {
            database.query(database.saveComment(comment.text, body.username, body.matchNumber, comment.alliance, comment.position), (err, results) => {
                consoleLog(err)
                consoleLog(results)
                consoleLog("Success in saving comments")
            })
        }
    }

    return res.send("req recieved")
})

module.exports = router