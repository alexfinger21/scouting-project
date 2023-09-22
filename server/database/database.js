const pool = require('./dbconfig')
const gameConstants = require('../game.js')
const game = require('../game.js')

function getUsers() {
    const returnStr = `
    SELECT um_id, um_name
    FROM teamsixn_scouting_dev.userMaster
    `
    return returnStr
}

function insertAllianceSelection(allianceNum, pos, team) {
    //console.log("Alliance num: " + allianceNum + " Pos: " +  pos + " Team #: " + team)
    return `INSERT INTO 
    teamsixn_scouting_dev.alliance_selection 
    (alliance_number, alliance_position, team_master_tm_number)
    VALUES
    (${allianceNum}, ${pos}, ${team});`
}

function deleteAllianceSelection(allianceNum, pos) {
    return `DELETE FROM teamsixn_scouting_dev.alliance_selection 
        WHERE 
        alliance_number = ${allianceNum} AND 
        alliance_position = ${pos};`
}


function deleteData(data) {
    return `DELETE FROM teamsixn_scouting_dev.game_details
    WHERE game_details.frc_season_master_sm_year = ${gameConstants.YEAR}
        AND game_details.competition_master_cm_event_code = '${gameConstants.COMP}'
        AND game_details.game_matchup_gm_game_type = '${gameConstants.GAME_TYPE}'
        AND game_details.game_matchup_gm_number = ${data.matchNumber}
        AND game_details.game_matchup_gm_alliance = '${data.alliance}'
        AND game_details.game_matchup_gm_alliance_position = ${data.position};`
}

function deleteAPIData() {
    return `DELETE FROM teamsixn_scouting_dev.api_rankings
    WHERE api_rankings.frc_season_master_sm_year = ${gameConstants.YEAR}
        AND api_rankings.competition_master_cm_event_code = '${gameConstants.COMP}';`
        
}

function writeAPIData(teamRankings) {
    let valuesStr = ""
    let counter = 0
    const time = new Date()
    //console.log(time)
    //console.log(teamRankings)

    for (const [k, team] of Object.entries(teamRankings)) {
        counter++
        const rank_str = String(team.rank)
        const team_num_str = String(k)
        const wins_str = String(team.record.wins)
        const losses_str = String(team.record.losses)
        const ties_str = String(team.record.ties)
        const dq_str = String(team.dq)
        const matches_played_str = String(team.matches_played)
        const opr_str = String(team.opr)
        const dpr_str = String(team.dpr)
        let a = "(" + gameConstants.YEAR + ",'" + gameConstants.COMP + "'," + team_num_str + "," + rank_str + "," + wins_str + "," + losses_str + "," + ties_str + "," + dq_str + "," + matches_played_str + "," + opr_str + "," + dpr_str + ",'" + String(time) + "')"
        //console.log(a)
        a = Object.keys(teamRankings).length != counter ? a + "," : a
        //console.log(a)

        valuesStr += a
    }

    //console.log(valuesStr)

    const sqlStr = `INSERT INTO teamsixn_scouting_dev.api_rankings
    (
        frc_season_master_sm_year, 
        competition_master_cm_event_code, 
        team_master_tm_number, api_rank, 
        api_win, api_loss, api_tie, api_dq, 
        api_matches_played, api_opr, api_dpr, api_rank_ts) 
        VALUES ${valuesStr}
            ;`

    //console.log(sqlStr)

    return sqlStr
}
function convertToInt(option) {
    switch (option) {
        case "engaged":
            return 3
        case "docked":
            return 2
        case "attempted":
            return 1
        case "unattempted":
            return 0
        case "none":
            return 3
        case "both":
            return 2
        case "ground":
            return 1
        case "substation":
            return 0
        case "often":
            return 0
        case "sometimes":
            return 1
        case "rarely":
            return 2
        case false:
            return -1
        case "n/a":
            return 0
    }
}

function saveData(data) {
    //console.log(data)
    const params =
        `${gameConstants.YEAR}, 
        '${gameConstants.COMP}', 
        '${gameConstants.GAME_TYPE}', 
        '${data.matchNumber}', 
        '${data.alliance}',
        '${data.position}',
        '${data.username}'`

    let autoScoring = []
    let teleopScoring = []
    
    let linkCount = 0
    let autoScoringStr = ""
    let teleopScoringStr = ""
    let linkArray = []

    let count = 0
    let count1 = 0

    for (let i = 0; i < 3; i++) {//row
        for (let j = 0; j < 3; j++) {//grid
            for (let x = 0; x < 3; x++) {//column
                if (data.tables["Robot Auto Scoring"][j][i][x] == "cone") {
                    autoScoring[count] = 1
                    linkArray[count] = 1
                } else if (data.tables["Robot Auto Scoring"][j][i][x] == "cube") {
                    autoScoring[count] = 2 
                    linkArray[count] = 2
                } else {
                    autoScoring[count] = 0
                    linkArray[count] = 0
                }

                count++
            }
        }
    }

    for (let i = 0; i<count; i++) {
        autoScoringStr += `,(${params}, '2', '${200 + i+1}', ${autoScoring[i]}) \n`
    }

    for (let i = 0; i<3; i++) {//row
        for (let j = 0; j<3; j++) {//grid
            for (let x = 0; x<3; x++) {//column
                if (data.tables["Robot Teleop Scoring"][j][i][x] == "cone") {
                    teleopScoring[count1] = 1
                    linkArray[count1] = 1
                } else if (data.tables["Robot Teleop Scoring"][j][i][x] == "cube") {
                    teleopScoring[count1] = 2 
                    linkArray[count1] = 2
                } else {
                    teleopScoring[count1] = 0
                }

                count1++
            }
        }
    }

    for (let i = 0; i<count1; i++) {
        teleopScoringStr += `,(${params}, '2', '${300 + i+1}', ${teleopScoring[i]}) \n`
    }

    //console.log(linkArray)

    for (let row = 0; row<3; row++) {
        for (let col = 0; col<9; col++) {
            //console.log(col)
            if (col < 7 && linkArray[row * 9 + col] != 0 && linkArray[row * 9 + col + 1] != 0 && linkArray[row * 9 + col + 2] != 0) {
                linkCount++
                //console.log("LINK = " + linkCount)
                //console.log("COLUMN = " + col)
                //console.log("ROW = " + row)
                col+=2
            }
        }
    }

    //console.log("LINK COUNT: " + linkCount)

    const sqlStr = `INSERT INTO teamsixn_scouting_dev.game_details (
        frc_season_master_sm_year,
        competition_master_cm_event_code,
        game_matchup_gm_game_type,
        game_matchup_gm_number,
        game_matchup_gm_alliance,
        game_matchup_gm_alliance_position,
        gd_um_id,
        game_element_group_geg_grp_key,
        game_element_ge_key,
        gd_value
        )
        VALUES 
        (${params}, '1', '101', ${data["Starting Position"]}), 
        (${params}, '1', '102', ${data["Robot Preload"]})
        ` + autoScoringStr + `,
        (${params}, '2', '228', ${data["Robot Leaves Community"]}),
        (${params}, '2', '229', ${convertToInt(data["Robot Auto Docking"])}),
        (${params}, '2', '230', ${data["Game pieces picked up in Auton"]})
        `+ teleopScoringStr + `,
        (${params}, '3', '328', ${data["Supercharged Cones"]}),
        (${params}, '3', '329', ${data["Supercharged Cubes"]}),
        (${params}, '4', '401', ${convertToInt(data["Robot Endgame Docking"])}),
        (${params}, '4', '402', ${data["Robot is in Community"]}),
        (${params}, '4', '403', ${linkCount}),
        (${params}, '4', '404', ${convertToInt(data["Game Piece Intake From"])}),
        (${params}, '4', '405', ${convertToInt(data["Robot Fumbles Cones"])}),
        (${params}, '4', '406', ${convertToInt(data["Robot Fumbles Cubes"])})
        ;`

        //console.log(sqlStr)

    return sqlStr
}

function getTeams() {
    const returnStr = `
    SELECT 
        *
    FROM
        teamsixn_scouting_dev.v_match_listing_display
    where 
    frc_season_master_sm_year = ${gameConstants.YEAR} and 
    competition_master_cm_event_code = '${gameConstants.COMP}' and
    gm_game_type = '${gameConstants.GAME_TYPE}';`

    return returnStr
}

function getCollectedData(match) {
    return `
    SELECT 
        gd.frc_season_master_sm_year, 
        gd.competition_master_cm_event_code, 
        gd.game_matchup_gm_game_type,
        gd.game_matchup_gm_number, 
        gd.game_matchup_gm_alliance, 
        gd.game_matchup_gm_alliance_position,
        gd_um_id, 
        count(1) as rec_cnt
    FROM 
        teamsixn_scouting_dev.game_details gd 
    WHERE 
        gd.frc_season_master_sm_year = ${gameConstants.YEAR} AND 
        gd.competition_master_cm_event_code = '${gameConstants.COMP}' AND
        gd.game_matchup_gm_game_type = '${gameConstants.GAME_TYPE}' AND
        game_matchup_gm_number = ${match}
    GROUP BY 
        gd.frc_season_master_sm_year, 
        gd.competition_master_cm_event_code, 
        gd.game_matchup_gm_game_type,
        gd.game_matchup_gm_number, 
        gd.game_matchup_gm_alliance, 
        gd.game_matchup_gm_alliance_position,
        gd_um_id
    ORDER BY 
        gd.frc_season_master_sm_year, 
        gd.competition_master_cm_event_code, 
        gd.game_matchup_gm_game_type,
        gd.game_matchup_gm_number, 
        gd.game_matchup_gm_alliance, 
        gd.game_matchup_gm_alliance_position,
        gd_um_id;`
}

function getAssignedTeam(username) {
    return `SELECT 
    cg.cg_gm_number, 
    gm.gm_game_type, 
    gm.gm_alliance , 
    gm.gm_alliance_position , 
    gm.team_master_tm_number, 
    cgua.cgua_user_id, 
    concat(tm_number ," - ", tm_name) as team_display
FROM 
    teamsixn_scouting_dev.current_game cg 
    LEFT JOIN
        teamsixn_scouting_dev.game_matchup gm 
        ON    cg.cg_sm_year  = gm.frc_season_master_sm_year and 
                cg.cg_cm_event_code  = gm.competition_master_cm_event_code and 
                cg.cg_gm_game_type = gm.gm_game_type and 
                cg.cg_gm_number  = gm.gm_number 
    LEFT JOIN 
        teamsixn_scouting_dev.current_game_user_assignment cgua 
        ON
            cgua.cgua_alliance = gm.gm_alliance and 
            cgua.cgua_alliance_position = gm.gm_alliance_position 
    LEFT JOIN 
        teamsixn_scouting_dev.team_master tm 
        ON
            tm.tm_number = gm.team_master_tm_number 
    WHERE
        cgua.cgua_user_id = '${username}'`
}

function getGameNumbers(eventCode, gameNumber) {
    return `
    SELECT 
        distinct gm.gm_number 
    FROM 
        teamsixn_scouting_dev.game_matchup gm 
    WHERE
    gm.frc_season_master_sm_year = ${gameConstants.YEAR} and 
        gm.competition_master_cm_event_code = '${gameConstants.COMP}' and 
        gm.gm_game_type  = '${gameConstants.GAME_TYPE}'
    ORDER BY 
        1;
    `
}

function getMatchData(gameNumber) {
    return `
    SELECT 
        gm.team_master_tm_number,
        tms.tm_name, 
        gm.gm_alliance, 
        gm.gm_alliance_position, 
        tms.games_played, 
        tms.api_rank, 
        tms.api_win,
        tms.api_loss, 
        tms.api_tie, 
        tms.api_opr,
        tms.api_opr_rank,
        tms.api_dpr,
        tms.api_dpr_rank,
        tms.avg_gm_score, 
        tms.avg_nbr_links, 
        tms.avg_auton_chg_station_score, 
        tms.avg_endgame_chg_station_score 
FROM 
    teamsixn_scouting_dev.game_matchup gm
    LEFT JOIN
      teamsixn_scouting_dev.tmp_match_strategy tms
      ON 
          gm.frc_season_master_sm_year = tms.frc_season_master_sm_year AND
            gm.competition_master_cm_event_code = tms.competition_master_cm_event_code AND
            gm.gm_game_type = tms.game_matchup_gm_game_type AND
            gm.team_master_tm_number = tms.team_master_tm_number
WHERE 
  gm.frc_season_master_sm_year = ${gameConstants.YEAR} AND
  gm.competition_master_cm_event_code = '${gameConstants.COMP}' AND
  gm.gm_game_type  = '${gameConstants.GAME_TYPE}' AND
  gm.gm_number = ${gameNumber}
ORDER BY 
  gm.frc_season_master_sm_year, 
  gm.competition_master_cm_event_code, 
  gm.gm_alliance DESC, 
  gm.gm_alliance_position ;`
}

function getChartData() {
    return `
    SELECT *
    FROM
        teamsixn_scouting_dev.tmp_match_strategy vts 
    WHERE
        vts.frc_season_master_sm_year = ${gameConstants.YEAR} AND
        vts.competition_master_cm_event_code = '${gameConstants.COMP}' AND
        ( vts.game_matchup_gm_game_type = '${gameConstants.GAME_TYPE}' or vts.game_matchup_gm_game_type IS NULL);
    `
}

function getTeamPictures(team) {
    return `
    select 
        *
    from 
        teamsixn_scouting_dev.pit_scouting ps 
    WHERE
        frc_season_master_sm_year = ${gameConstants.YEAR} and 
        competition_master_cm_event_code = '${gameConstants.COMP}' and 
        team_master_tm_number = ${team};
    `
}

function executeQuery(sql, callback) {
    pool.query(sql, function (error, results, fields) {
        if (error) {
            return callback(error, null)
        } else {
            return callback(null, results)
        }
    })
}

function saveComment(comment, user_id, matchNumber, alliance, alliancePosition) {
    return `INSERT INTO teamsixn_scouting_dev.game_comments
    (frc_season_master_sm_year, competition_master_cm_event_code, game_matchup_gm_game_type, game_matchup_gm_number, game_matchup_gm_alliance, game_matchup_gm_alliance_position, gc_comment, gc_um_id, gc_ts)
    VALUES(${gameConstants.YEAR}, '${gameConstants.COMP}', '${gameConstants.GAME_TYPE}', ${matchNumber}, '${alliance}', ${alliancePosition}, '${comment}', '${user_id}', '${new Date()}');`
}

function clearMatchStretegyTemp() {
    return `DROP TABLE IF EXISTS teamsixn_scouting_dev.tmp_match_strategy;`
}

function saveMatchStrategy() {
    return `CREATE TABLE teamsixn_scouting_dev.tmp_match_strategy AS
    SELECT
        *, 
        rank() OVER (ORDER BY api_opr desc) AS api_opr_rank, 
        rank() OVER (ORDER BY api_dpr desc) AS api_dpr_rank
    FROM 
        teamsixn_scouting_dev.v_match_team_score_avg_rankings vmtsar 
    where 
        frc_season_master_sm_year = 2023 and 
        competition_master_cm_event_code = '${gameConstants.COMP}' and 
        game_matchup_gm_game_type = '${gameConstants.GAME_TYPE}' and 
        team_master_tm_number is not NULL;`
}

function getMatchComments(team) {
    return `select 
        gm.team_master_tm_number, 
        gc.game_matchup_gm_number, 
        gc.gc_ts, 
        gc.gc_um_id, 
        gc.gc_comment 
    from 
        game_comments gc
        left join
            game_matchup gm 
            on    gc.frc_season_master_sm_year = gm.frc_season_master_sm_year and 
                    gc.competition_master_cm_event_code = gm.competition_master_cm_event_code and 
                    gc.game_matchup_gm_game_type = gm.gm_game_type and 
                    gc.game_matchup_gm_alliance  = gm.gm_alliance  and 
                    gc.game_matchup_gm_alliance_position = gm.gm_alliance_position  and 
                    gc.game_matchup_gm_number = gm.gm_number 
    WHERE
        gc.frc_season_master_sm_year = ${gameConstants.YEAR} and 
        gc.competition_master_cm_event_code = '${gameConstants.COMP}' and 
        gc.game_matchup_gm_game_type  = '${gameConstants.GAME_TYPE}' and 
        gm.team_master_tm_number = ${team} and 
        trim(gc.gc_comment) <> "" `
}

module.exports = {
    getMatchData: getMatchData,
    getGameNumbers: getGameNumbers,
    query: executeQuery,
    getTeams: getTeams,
    getCollectedData: getCollectedData,
    saveData: saveData,
    deleteData: deleteData,
    getAssignedTeam: getAssignedTeam,
    writeAPIData: writeAPIData,
    deleteAPIData: deleteAPIData,
    getChartData: getChartData,
    insertAllianceSelection: insertAllianceSelection,
    deleteAllianceSelection: deleteAllianceSelection,
    getTeamPictures: getTeamPictures,
    saveMatchStrategy: saveMatchStrategy,
    clearMatchStretegyTemp: clearMatchStretegyTemp,
    saveComment: saveComment,
    getMatchComments: getMatchComments
}