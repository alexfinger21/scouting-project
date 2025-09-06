import database from "../database/database.js"
import express from "express"
import gameConstants from "../game.js"
import { consoleLog } from "../utility.js"
import { getImageData } from "../getImages.js"
import {getMatchVideos } from "../TBAAPIData.js"
import SQL from "sql-template-strings"

const router = express.Router()

function mergeDicts(dict1, dict2) {
    if (dict1 && dict2) {
        dict1 = Object.assign(dict1, dict2)   
    }

    return dict1
}

router.get("/", async function (req, res) { //only gets used if the url == team-details
    consoleLog("recieved")
    const start = Date.now()
    let [err1, team_results] = await database.query(database.getTeamDetailsTeamData())

    team_results = JSON.parse(JSON.stringify(team_results))
    let teamNumber = req.query.team || 695
    const selectedPage = req.query.selectedPage || "game-data-page"

    let matchVideos

    try {
        matchVideos = await getMatchVideos()
    }
    catch {
        matchVideos = []
    }    

    let teamInfo = team_results.find(element => element.team_master_tm_number == teamNumber)
    if(teamInfo == null || teamInfo == undefined) {
        teamInfo = team_results[0]
        teamNumber = team_results[0].team_master_tm_number
    }


    let [err2, results] = await database.query(SQL`SELECT DISTINCT gd.gd_um_id, vmd.*
FROM teamsixn_scouting_dev.game_details gd
INNER JOIN (
SELECT
        *
        FROM 
            teamsixn_scouting_dev.v_match_detail vmd
         WHERE
            vmd.frc_season_master_sm_year = ${gameConstants.YEAR} AND
            vmd.competition_master_cm_event_code = ${gameConstants.COMP} AND 
            vmd.game_matchup_gm_game_type = ${gameConstants.GAME_TYPE} AND
            vmd.team_master_tm_number = ${teamNumber}
) AS vmd ON vmd.frc_season_master_sm_year = gd.frc_season_master_sm_year AND
        	vmd.competition_master_cm_event_code = gd.competition_master_cm_event_code
        	AND
        	vmd.game_matchup_gm_game_type = gd.game_matchup_gm_game_type AND
        	vmd.game_matchup_gm_number = gd.game_matchup_gm_number AND
        	vmd.game_matchup_gm_alliance = gd.game_matchup_gm_alliance AND
        	vmd.game_matchup_gm_alliance_position = gd.game_matchup_gm_alliance_position; `)
    results = JSON.parse(JSON.stringify(results))
    

    consoleLog("TEAM: " + teamNumber, results)

    let [err3, pictures] = await database.query(database.getTeamPictures(teamNumber))

    pictures = JSON.parse(JSON.stringify(pictures))
    consoleLog("PICTURES: ")
    consoleLog(pictures)

    const websiteURLs = await getImageData("image", teamNumber)

    let urls = []
    if (pictures.length > 0) {
        teamInfo = mergeDicts(teamInfo, pictures[0])
        consoleLog("MERGED: ")
        consoleLog(teamInfo)
        if(teamInfo.ps_picture_full_robot != null && teamInfo.ps_picture_full_robot.length > 0) {
            urls.push("https://drive.google.com/uc?export=view&id=" + teamInfo.ps_picture_full_robot.split("id=").pop())
        }
        if(teamInfo.ps_picture_drivetrain != null && teamInfo.ps_picture_drivetrain.length > 0) {
            urls.push("https://drive.google.com/uc?export=view&id=" + teamInfo.ps_picture_drivetrain.split("id=").pop())
        }
    }



    let [err4, comments] = await database.query(database.getMatchComments(teamNumber))
    comments = JSON.parse(JSON.stringify(comments))

    consoleLog("COMMENTS: ")
    consoleLog(comments)

    consoleLog("the request took " + (Date.now() - start) / 1000)

    let [err5, pitData] = await database.query(SQL`SELECT * FROM survey_responses sr WHERE 
        sr.Team_Number = ${teamNumber};`)

    pitData = JSON.parse(JSON.stringify(pitData))

    consoleLog("PIT DATA", pitData)

    if (pitData?.length > 0) {
        consoleLog(teamInfo)
        Object.assign(teamInfo, pitData[0])
    }


    urls = [teamInfo.picture_full_robot, teamInfo.picture_drive_train, ...websiteURLs, ...urls]

    let index = urls.indexOf(undefined)

    while (index > -1) {
        urls.splice(index, 1)
        index = urls.indexOf(undefined)
    }

    const teamData = results.slice().sort((a, b) => a.game_matchup_gm_number - b.game_matchup_gm_number)

    res.render("team-details", {
        teams: team_results.map(e => e.team_master_tm_number).sort((a, b) => a - b),
        teamData: teamData,
        teamInfo: teamInfo,
        matchVideos: matchVideos,
        selectedTeam: teamNumber,
        teamPictures: urls,
        comments: comments,
        selectedPage: selectedPage,
        match: teamData[0].game_matchup_gm_number,
    })
})

router.post("/", function (req, res) {
    return res.send("req recieved")
})

export default router
