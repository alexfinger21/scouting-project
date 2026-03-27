import database from "../database/database.js"
import express from "express"
import gameConstants from "../game.js"
import { getMatchVideos } from "../TBAAPIData.js"
import SQL from "sql-template-strings"
import { getPitScoutingData } from "../pit-scouting.js"

const router = express.Router()


// --------------------------------------
// Old Scouting APP Database stuff
// -------------------------------------- 
router.get("/", async function (req, res) {
    //console.log("1 "+Date.now());
    //only gets used if the url == team-details
    let [err1, team_results] = await database.query(
        database.getTeamDetailsTeamData(),
    )
    //console.log("2 "+Date.now());

    team_results = JSON.parse(JSON.stringify(team_results))
    let teamNumber = req.query.team || 695
    const selectedPage = req.query.selectedPage || "game-data-page"

    let matchVideos

    //console.log("3 "+Date.now());

    try {
        matchVideos = await getMatchVideos()
    } catch {
        matchVideos = []
    }

    let teamInfo = team_results.find(
        (element) => element.team_master_tm_number == teamNumber,
    )
    if (teamInfo == null || teamInfo == undefined) {
        teamInfo = team_results[0]
        teamNumber = team_results[0].team_master_tm_number
    }


    //console.log("4 "+Date.now());

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


    //console.log("5 "+Date.now());

    let [err4, comments] = await database.query(
        database.getMatchComments(teamNumber),
    )
    comments = JSON.parse(JSON.stringify(comments))

    //console.log("6 "+Date.now());

    // Get auton paths for the team to display on the team details page
    let [err5, autonPaths] = await database.query(
        database.getAutonPaths(teamNumber),
    )
    autonPaths = JSON.parse(JSON.stringify(autonPaths)).map((entry) => ({
        ...entry,
        autonPathEncoded: encodeURIComponent(String(entry.gd_auton_path ?? "")),
    }))

    //console.log("7 "+Date.now());

    const teamData = results
        .slice()
        .sort((a, b) => a.game_matchup_gm_number - b.game_matchup_gm_number)

    //console.log("8 "+Date.now());
    
    const pitScoutingData = await getPitScoutingData(req, teamNumber, team_results)


    //console.log("9 "+Date.now());

    res.render("team-details", {
        teams: team_results
        .map((e) => e.team_master_tm_number)
        .sort((a, b) => a - b),
        teamData: teamData,
        teamInfo: teamInfo,
        matchVideos: matchVideos,
        selectedTeam: teamNumber,
        comments: comments,
        autonPaths,
        selectedPage: selectedPage,
        match: teamData[0]?.game_matchup_gm_number ?? null,
        pitScoutingData,
    })
})

router.post("/", function (req, res) {
    return res.send("req received")
})

export default router
