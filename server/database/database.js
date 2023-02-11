const pool = require('./dbconfig')
const YEAR = 2023
const COMP = "test"
const GAME_TYPE = "Q"


function getUsers() {
    const returnStr = `
    SELECT um_id, um_name
    FROM teamsixn_scouting_dev.userMaster
    `
    return returnStr
}

function deleteData(data) {
    return `DELETE FROM teamsixn_scouting_dev.game_details
    WHERE game_details.frc_season_master_sm_year = 2023
        AND game_details.competition_master_cm_event_code = '${COMP}'
        AND game_details.game_matchup_gm_game_type = '${GAME_TYPE}'
        AND game_details.game_matchup_gm_number = ${data.matchNumber}
        AND game_details.game_matchup_gm_alliance = 'R'
        AND game_details.game_matchup_gm_alliance_position = 1;`
}

function convertToInt(option) {
    switch (option) {
        case "engaged":
            return 3
        case "docked":
            return 2
        case "attempted (unsuccessful)":
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
    }
}

function saveData(data) {
    console.log(data)
    const params =
        `${YEAR}, 
        '${COMP}', 
        '${GAME_TYPE}', 
        '${data.matchNumber}', 
        'R',
        '1',
        '${data.username}'`

    let autoScoring = []
    let teleopScoring = []

    let autoScoringStr = ""
    let teleopScoringStr = ""

    let count = 0
    let count1 = 0

    for (let i = 0; i < 3; i++) {//row
        for (let j = 0; j < 3; j++) {//grid
            for (let x = 0; x < 3; x++) {//column
                if (data.tables["Robot Auto Scoring"][j][i][x] == "cone") {
                    autoScoring[count] = 1
                } else if (data.tables["Robot Auto Scoring"][j][i][x] == "cube") {
                    autoScoring[count] = 2 
                } else {
                    autoScoring[count] = 0
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
                } else if (data.tables["Robot Teleop Scoring"][j][i][x] == "cube") {
                    autoScoring[count1] = 2 
                } else {
                    autoScoring[count1] = 0
                }

                count1++
            }
        }
    }

    for (let i = 0; i<count1; i++) {
        teleopScoringStr += `,(${params}, '2', '${200 + i+1}', ${teleopScoringStr[i]}) \n`
    }

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
        (${params}, '2', '229', ${convertToInt(data["Robot Auto Docking"])});`

        console.log(sqlStr)

    return sqlStr
}

function getTeams() {
    const returnStr = `
    SELECT 
        r1.frc_season_master_sm_year,	
        r1.competition_master_cm_event_code, 
        r1.gm_game_type,	
        r1.gm_number,	
        r1.gm_timestamp,
        r1.team_master_tm_number as r1_team_number,
        r2.team_master_tm_number as r2_team_number,
        r3.team_master_tm_number as r3_team_number,
        b1.team_master_tm_number as b1_team_number,
        b2.team_master_tm_number as b2_team_number,
        b3.team_master_tm_number as b3_team_number
    FROM
        (select frc_season_master_sm_year,	competition_master_cm_event_code,	gm_game_type,	gm_number,	gm_alliance,	gm_alliance_position,	team_master_tm_number, gm_timestamp
        from teamsixn_scouting_dev.game_matchup gm  where gm_alliance = 'R' and gm_alliance_position = 1) r1,
        (select frc_season_master_sm_year,	competition_master_cm_event_code,	gm_game_type,	gm_number,	gm_alliance,	gm_alliance_position,	team_master_tm_number, gm_timestamp
        from teamsixn_scouting_dev.game_matchup gm  where gm_alliance = 'R' and gm_alliance_position = 2) r2, 
        (select frc_season_master_sm_year,	competition_master_cm_event_code,	gm_game_type,	gm_number,	gm_alliance,	gm_alliance_position,	team_master_tm_number, gm_timestamp
        from teamsixn_scouting_dev.game_matchup gm  where gm_alliance = 'R' and gm_alliance_position = 3) r3,
        (select frc_season_master_sm_year,	competition_master_cm_event_code,	gm_game_type,	gm_number,	gm_alliance,	gm_alliance_position,	team_master_tm_number, gm_timestamp
        from teamsixn_scouting_dev.game_matchup gm  where gm_alliance = 'B' and gm_alliance_position = 1) b1,
        (select frc_season_master_sm_year,	competition_master_cm_event_code,	gm_game_type,	gm_number,	gm_alliance,	gm_alliance_position,	team_master_tm_number, gm_timestamp
        from teamsixn_scouting_dev.game_matchup gm  where gm_alliance = 'B' and gm_alliance_position = 2) b2, 
        (select frc_season_master_sm_year,	competition_master_cm_event_code,	gm_game_type,	gm_number,	gm_alliance,	gm_alliance_position,	team_master_tm_number, gm_timestamp
        from teamsixn_scouting_dev.game_matchup gm  where gm_alliance = 'B' and gm_alliance_position = 3) b3
    WHERE 
        r1.frc_season_master_sm_year = r2.frc_season_master_sm_year and 
        r1.competition_master_cm_event_code = r2.competition_master_cm_event_code and
        r1.gm_game_type = r2.gm_game_type	and 
        r1.gm_number = r2.gm_number and 
        r1.frc_season_master_sm_year = r3.frc_season_master_sm_year and 
        r1.competition_master_cm_event_code = r3.competition_master_cm_event_code and
        r1.gm_game_type = r3.gm_game_type	and 
        r1.gm_number = r3.gm_number and 
        r1.frc_season_master_sm_year = b1.frc_season_master_sm_year and 
        r1.competition_master_cm_event_code = b1.competition_master_cm_event_code and
        r1.gm_game_type = b1.gm_game_type	and 
        r1.gm_number = b1.gm_number and 
        r1.frc_season_master_sm_year = b2.frc_season_master_sm_year and 
        r1.competition_master_cm_event_code = b2.competition_master_cm_event_code and
        r1.gm_game_type = b2.gm_game_type	and 
        r1.gm_number = b2.gm_number and 
        r1.frc_season_master_sm_year = b3.frc_season_master_sm_year and 
        r1.competition_master_cm_event_code = b3.competition_master_cm_event_code and
        r1.gm_game_type = b3.gm_game_type	and 
        r1.gm_number = b3.gm_number and 
        r1.frc_season_master_sm_year = 2023 and 
        r1.competition_master_cm_event_code = 'test' and
        r1.gm_game_type = 'Q';`

    return returnStr
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
    gm.frc_season_master_sm_year = 2023 and 
        gm.competition_master_cm_event_code = 'test' and 
        gm.gm_game_type  = 'Q'
    ORDER BY 
        1;
    `
}

function getMatchData(gameNumber) {
    return `
    SELECT 
        gm.gm_game_type,
        gm.gm_number,
        gm.gm_alliance , 
        gm.gm_alliance_position , 
        gm.team_master_tm_number,
        concat(tm_number ," - ", tm_name) as team_display
    FROM 
        teamsixn_scouting_dev.game_matchup gm
    LEFT JOIN 
        teamsixn_scouting_dev.team_master tm 
        ON
            tm.tm_number = gm.team_master_tm_number 
    WHERE
        gm.frc_season_master_sm_year = 2023 and 
        gm.competition_master_cm_event_code = 'test' and 
        gm.gm_game_type = 'Q' and 
        gm.gm_number = ${gameNumber}
    ORDER BY 
        gm.gm_game_type,
        gm.gm_number,
        gm.gm_alliance, 
        gm.gm_alliance_position ;`
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

module.exports = {
    getMatchData: getMatchData,
    getGameNumbers: getGameNumbers,
    query: executeQuery,
    getTeams: getTeams,
    saveData: saveData,
    deleteData: deleteData,
    getAssignedTeam: getAssignedTeam
}