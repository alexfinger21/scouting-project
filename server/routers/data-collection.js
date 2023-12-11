const database = require("../database/database.js")
const express = require("express")
const { checkAdmin, consoleLog, parseData } = require("../utility")
const gameConstants = require("../game.js")
const router = express.Router()
const SQL = require('sql-template-strings')

async function getMatchup(match) {
    const [err, matchup] = await database.query(database.getMatchData(match))

    return parseData(matchup)
}

async function getGameNumbers() {
    const [err, gameNumbers] = await database.query(database.getGameNumbers())
    return parseData(gameNumbers)
}

async function getSeventhScouter(username) {
    const [error, dbRes] = await database.query(database.getSeventhScouter(username))
    const seventhScouterRes = parseData(dbRes)
    return seventhScouterRes[0].cgua_user_id
}

async function getRunningMatch() {
    const [error, dbres] = await database.query(SQL`select * from teamsixn_scouting_dev.current_game;`)
    const runningMatchResults = parseData(dbres)
    if (runningMatchResults[0] && error == null) { //if a match is running
        return runningMatchResults[0].cg_gm_number
    }
    return 1
}

async function getAssignment(username) {
    const [error, dbres] = await database.query(database.getAssignedTeam(username))
    const assignment = parseData(dbres)[0]

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
        return assignment
    }

    return null
}

async function getRandomAssignment(username, runningMatch) {
    const [error, dbres] = await database.query(database.getRandomTeam(username, runningMatch))
    const assignment = parseData(dbres)[0]

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

        return assignment
    }

    return null
}

async function updateData(info, isSeventh) {
    const [err, deletion] = await database.query(database.deleteData(info))
    if (err) {
        consoleLog("ERROR DELETING DATA: " + err)
    }
    const [err2, saved] = await database.query(database.saveData(info))

    if (err2) {
        consoleLog.log("ERROR SAVING DATA: " + err2)
    }
    const [err3, update] = await database.query(SQL`update teamsixn_scouting_dev.game_details gd
            set gd.gd_score = gd_score(gd.game_element_ge_key, gd.gd_value)
            WHERE 
                gd.frc_season_master_sm_year = ${gameConstants.YEAR} and
                gd.competition_master_cm_event_code = ${gameConstants.COMP} and 
                gd.game_matchup_gm_game_type = ${gameConstants.GAME_TYPE} and 
                gd.game_matchup_gm_number = ${info.matchNumber};`)
    if(err3) {
        consoleLog("ERROR UPDATING GAME DETAILS: " + err3)
    }
    
    if (info.comments) {
        const [err4, comment] = await database.query(database.saveComment(body.comments, body.username, body.matchNumber, body.alliance, body.position))
        if(err4) {
            consoleLog("ERROR SAVING COMMENTS: " + err4)
        }
    }
}

router.get("/", async function (req, res) { //only gets used if the url == data-collection
    const isAdmin = await checkAdmin(req)
    const username = req.cookies["username"]
    consoleLog("SELECTED PAGE " + req.query.selectedPage)
    const selectedPage = req.query.selectedPage || "scouting-page"
    const match = req.query.match ? req.query.match : process.env.lastPlayedMatch
    const runningMatch = await getRunningMatch()
    let assignment = null

    const seventhScouter = await getSeventhScouter(username)

    if (seventhScouter == username) { //assign user a random team
        assignment = await getRandomAssignment(username, runningMatch)
    }
    else { //not a seventh scouter
        assignment = await getAssignment(username)
    }

    const gameNumbers = await getGameNumbers()
    const matchup = await getMatchup(match)
    //consoleLog("\nMATCH DATA: ")
    //consoleLog(matchup)

    res.render("data-collection", {
        matches: gameNumbers,
        lastMatch: match,
        runningMatch: runningMatch,
        assignment: assignment,
        isAdmin: isAdmin,
        matchup: matchup,
        selectedPage: selectedPage
    })
})


router.post("/", function (req, res) {
    const body = req.body
    body.username = req.cookies["username"]
    const user_id = req.cookies["user_id"]

    consoleLog(body)

    if (body.type == "scouting") {
        const seventhScouter = getSeventhScouter(username)
        if(seventhScouter == username) {
            consoleLog("Save!!")
            //updateData()
        }
        else {
            consoleLog("Seventh scouter :joy:")
        }
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