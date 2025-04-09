const pool = require('./dbconfig')
const gameConstants = require('../game.js')
const game = require('../game.js')

const SQL = require('sql-template-strings')

function getUsers() {
    const returnStr = SQL`
    SELECT um_id, um_name
    FROM teamsixn_scouting_dev.userMaster
    `
    return returnStr
}

function insertAllianceSelection(allianceNum, pos, team) {
    //console.log("Alliance num: " + allianceNum + " Pos: " +  pos + " Team #: " + team)
    return SQL`INSERT INTO 
    teamsixn_scouting_dev.alliance_selection 
    (alliance_number, alliance_position, team_master_tm_number)
    VALUES
    (${allianceNum}, ${pos}, ${team});`
}

function deleteAllianceSelection(allianceNum, pos) {
    return SQL`DELETE FROM teamsixn_scouting_dev.alliance_selection 
        WHERE 
        alliance_number = ${allianceNum} AND 
        alliance_position = ${pos};`
}


function deleteData(data) {
    return SQL`DELETE FROM teamsixn_scouting_dev.game_details
    WHERE game_details.frc_season_master_sm_year = ${gameConstants.YEAR}
        AND game_details.competition_master_cm_event_code = ${gameConstants.COMP}
        AND game_details.game_matchup_gm_game_type = ${gameConstants.GAME_TYPE}
        AND game_details.game_matchup_gm_number = ${data.matchNumber}
        AND game_details.game_matchup_gm_alliance = ${data.alliance}
        AND game_details.game_matchup_gm_alliance_position = ${data.position};`
}

function deleteAPIData() {
    return SQL`DELETE FROM teamsixn_scouting_dev.api_rankings
    WHERE api_rankings.frc_season_master_sm_year = ${gameConstants.YEAR}
        AND api_rankings.competition_master_cm_event_code = ${gameConstants.COMP};`

}

function writeAPIData(teamRankings) {
    let valuesStr = ""
    let counter = 0
    const time = new Date()
    //console.log(time)

    for (const [k, team] of Object.entries(teamRankings)) {
        counter++
        const rank_str = String(team.rank ?? 0)
        const team_num_str = String(k)
        const wins_str = String(team.record.wins ?? 0)
        const losses_str = String(team.record.losses ?? 0)
        const ties_str = String(team.record.ties ?? 0)
        const dq_str = String(team.dq ?? 0)
        const matches_played_str = String(team.matches_played ?? 0)
        const opr_str = String(team.opr ?? 0)
        const dpr_str = String(team.dpr ?? 0)
        let a = "(" + gameConstants.YEAR + ",'" + gameConstants.COMP + "'," + team_num_str + "," + rank_str + "," + wins_str + "," + losses_str + "," + ties_str + "," + dq_str + "," + matches_played_str + "," + opr_str + "," + dpr_str + ",'" + String(time) + "')"
        //console.log(a)
        a = Object.keys(teamRankings).length != counter ? a + "," : a
        //console.log(a)

        valuesStr += a
    }

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
        case "n/a":
            return 0
        case "not-parked":
            return 0
        case "parked":
            return 1
        case "shallow-climb":
            return 2
        case "deep-climb":
            return 3
        case "no-position":
            return 0
        case "outer-position":
            return 1
        case "middle-position":
            return 2
        case "inner-position":
            return 3
        case "yes":
            return 1
        case true:
            return 1
        default:
            return 0
    }
}

function executeQuery(sql, callback=false) {
    return new Promise(async (res, rej) => {

        if (sql.then) {
            sql = await sql
        }

        pool.query(sql, function (error, results, fields) {
            if (error) {
                console.log(sql)
                if (callback) {
                    rej(callback(error, null))
                }
                else {
                    rej([error, null])
                }
                console.log("ERROR: " + String(error))
                throw new Error()
            } else {
                if (callback) {
                    res(callback(null, results))
                }
                else {
                    res([null, results])
                }
            }
        })
    })
}

function saveData(data, is7thScouter=false) {
    //console.log(data)
    // scouting spreadsheet - https://docs.google.com/spreadsheets/d/1hft7JK_27KZjTL4E_xL3k83UKppFILQj7WBnTqjRwD0/edit?gid=0#gid=0
    const params = 
        `${gameConstants.YEAR}, 
        '${gameConstants.COMP}', 
        '${gameConstants.GAME_TYPE}', 
        ${data.matchNumber}, 
        '${data.alliance}',
        ${data.position},
        '${data.username}'`

    let autoStr = ""
    let teleopStr = ""

    for (let i = 0; i<12; ++i) {
        const char = String.fromCharCode(65+i)
        for (let j = 1; j<=4; ++j) {
            autoStr += `(${params}, 2, ${"2" + j + String(i+1).padStart(2, '0') + '0'}, ${data.gameData.auton[char]["L" + j].missed}),`
            autoStr += `(${params}, 2, ${"2" + j + String(i+1).padStart(2, '0') + '1'}, ${data.gameData.auton[char]["L" + j].scored}),`
        }
    } 

    console.log("TELEOP:", teleopStr)
    for (let i = 0; i<12; ++i) {
        const char = String.fromCharCode(65+i)
        for (let j = 1; j<=4; ++j) {
            if (data.gameData.teleop[char]["L" + j].scored > 0) {
                console.log(`(${params}, 3, ${"3" + j + String(i+1).padStart(2, '0') + '0'}, ${data.gameData.teleop[char]["L" + j].scored}),`)
            }
            teleopStr += `(${params}, 3, ${"3" + j + String(i+1).padStart(2, '0') + '0'}, ${data.gameData.teleop[char]["L" + j].missed}),`
            teleopStr += `(${params}, 3, ${"3" + j + String(i+1).padStart(2, '0') + '1'}, ${data.gameData.teleop[char]["L" + j].scored}),`
        }
    } 

    for (let i = 0; i<6; ++i) {
        teleopStr += `(${params}, 2, ${2008+i}, ${data?.gameData?.algae?.[2008+i].isSelected}),`
    } 


    /*
    for (const [i, v] of Object.entries(data.gameData.spotlights)) {
        autonScoringStr += ` ${data.position}, '${data.username}', 4,  ${i}, ${(v == 2 && i == (402 + data.gameData["Instage Location"])) ? 3 : v}),`  
    }
    */


    const sqlStr = SQL`INSERT INTO teamsixn_scouting_dev.game_details (
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
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 1, 1001, ${data.gameData["Starting Location"]}), 
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 1, 1002, ${data["preloaded"] ?? 0}),
    `.append(autoStr).append(SQL`
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 2001, ${data["robot-taxies"] ?? 0}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 2003, ${data.gameData.auton["algae-count"] ?? 0}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 2004, ${data.gameData.auton["processor"]?.count ?? 0}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 2005, ${data.gameData.auton["net"]?.count ?? 0}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 3, 3003, ${data["algae-dislodge"] ?? 0}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 3, 3004, ${data.gameData.teleop["processor"]?.count ?? 0}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 3, 3005, ${data.gameData.teleop["net"]?.count ?? 0}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 3, 3006, ${data["opposite-processor-count"] ?? 0}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 3, 3007, ${data["hp-count"] ?? 0}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 3, 3008, ${data["hp-missed"] ?? 0}),
    `).append(teleopStr).append(SQL`
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 4, 4001, ${convertToInt(data["robot-endgame"]) ?? 0}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 4, 4002, ${convertToInt(data["climb-position"]) ?? 0}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 5001, ${data["foul-count"]}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 5002, ${data["tech-foul-count"]}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 5003, ${convertToInt(data["entered-opponent-barge"])}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 5004, ${convertToInt(data["plays-defense"])}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 1, 5005, ${data["algae-ground-pickup"] ?? 0}),
    (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 1, 5006, ${data["coral-ground-pickup"] ?? 0})
    ;`)
    
    return sqlStr
}
function saveAutonPath(data) {
    return SQL`
    INSERT INTO teamsixn_scouting_dev.game_details (
        frc_season_master_sm_year,
        competition_master_cm_event_code,
        game_matchup_gm_game_type,
        game_matchup_gm_number,
        game_matchup_gm_alliance,
        game_matchup_gm_alliance_position,
        gd_um_id,
        game_element_group_geg_grp_key,
        game_element_ge_key,
        gd_value,
        gd_auton_path
    )
    VALUES 
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 2102, 0, ${data.gameData.auton.path ?? ""});`
}

function getTeams() {
    const returnStr = SQL`
    SELECT 
        *
        FROM
    teamsixn_scouting_dev.v_match_listing_display
    where 
    frc_season_master_sm_year = ${gameConstants.YEAR} and 
    competition_master_cm_event_code = ${gameConstants.COMP} and
    gm_game_type = ${gameConstants.GAME_TYPE};`

    return returnStr
}


function getMatchVerify() { //temporary unverified matchup
    const returnStr = SQL`
    SELECT 
        *
        FROM
    teamsixn_scouting_dev.v_match_listing_display_x`

    return returnStr
}

function removeMatchup() {
    return SQL`
    DELETE 
    gm
    FROM 
    teamsixn_scouting_dev.game_matchup gm
    JOIN
    (SELECT frc_season_master_sm_year, competition_master_cm_event_code, gm_game_type FROM teamsixn_scouting_dev.game_matchup_x LIMIT 1) f
    on    gm.frc_season_master_sm_year = f.frc_season_master_sm_year and 
    gm.competition_master_cm_event_code = f.competition_master_cm_event_code and
    gm.gm_game_type = f.gm_game_type;`
}

function addMatchup() { //add from get match verify
    return SQL`
    INSERT INTO teamsixn_scouting_dev.game_matchup 
    SELECT 
    gmx.*, 
        '' as cm_event_code 
    from 
    teamsixn_scouting_dev.game_matchup_x gmx 
    WHERE 
    gmx.frc_season_master_sm_year = ${gameConstants.YEAR} and 
    gmx.competition_master_cm_event_code = ${gameConstants.COMP} and
    gmx.gm_game_type = ${gameConstants.GAME_TYPE};`
}

function getCollectedData(match) {
    return SQL`
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
    gd.competition_master_cm_event_code = ${gameConstants.COMP} AND
    gd.game_matchup_gm_game_type = ${gameConstants.GAME_TYPE} AND
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

function getRandomTeam(username, matchNumber) {//for the seventh scouter
    //assigns a pseudo-random team to the seventh scouter using match number
    //so its reproducable
    let gm_alliance = matchNumber % 2 == 0 ? "B" : "R"
    let gm_alliance_position = matchNumber % 3 + 1

    return `SELECT 
    cg.cg_gm_number,
        gm.gm_game_type,
        gm.gm_alliance,
        gm.gm_alliance_position,
        gm.team_master_tm_number,
        tm.tm_name,
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
    teamsixn_scouting_dev.team_master tm      
    ON
    tm.tm_number = gm.team_master_tm_number
    WHERE
    gm.gm_alliance = '${gm_alliance}' and
    gm.gm_alliance_position = '${gm_alliance_position}'`

}
function getAssignedTeam(username) {
    return SQL`SELECT 
    cg.cg_gm_number, 
        gm.gm_game_type, 
        gm.gm_alliance , 
        gm.gm_alliance_position , 
        gm.team_master_tm_number, 
        cgua.cgua_user_id, 
        tm.tm_name,
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
    cgua.cgua_user_id = ${username}`
}

function saveMatchStrategy() {
    return SQL`CREATE TABLE IF NOT EXISTS teamsixn_scouting_dev.tmp_match_strategy AS
    SELECT
        *, 
        rank() OVER (ORDER BY vmsa.api_opr desc) AS api_opr_rank, 
        rank() OVER (ORDER BY vmsa.api_dpr desc) AS api_dpr_rank
    FROM 
    teamsixn_scouting_dev.v_match_summary_api vmsa 
    where 
    frc_season_master_sm_year = ${gameConstants.YEAR} and 
    competition_master_cm_event_code = ${gameConstants.COMP} and 
    game_matchup_gm_game_type = ${gameConstants.GAME_TYPE} and 
    team_master_tm_number is not NULL;`
}

function getSeventhScouter() {
    return SQL`SELECT * FROM teamsixn_scouting_dev.current_game_user_assignment
    ORDER BY cgua_scouter_number DESC
    LIMIT 1;`
}

function getGameNumbers(eventCode, gameNumber) {
    return SQL`
    SELECT 
    distinct gm.gm_number 
    FROM 
    teamsixn_scouting_dev.game_matchup gm 
    WHERE
    gm.frc_season_master_sm_year = ${gameConstants.YEAR} and 
    gm.competition_master_cm_event_code = ${gameConstants.COMP} and 
    gm.gm_game_type  = ${gameConstants.GAME_TYPE}
    ORDER BY 
    1;
    `
}

async function getScouter(gm_number, alliance_color,alliance_position){
    SQL`SELECT DISTINCT gd_um_id from game_details gd where
        (gd.frc_season_master_sm_year = ${gameConstants.YEAR} AND 
        gd.competition_master_cm_event_code = "${gameConstants.COMP}" AND
        gd.game_matchup_gm_game_type = "${gameConstants.GAME_TYPE}" AND
        gd.game_matchup_gm_number = ${gm_number} AND
        gd.game_matchup_gm_alliance = "${alliance_color}"
        AND gd.game_matchup_gm_alliance_position = ${alliance_number}`
        
}

function checkTempMatchStrategy() {
    return new Promise(async (res, rej) => {
        await executeQuery(saveMatchStrategy())

        return res(true)
    })
}

async function getMatchData(gameNumber) {

    await checkTempMatchStrategy()
    return SQL`
    SELECT 
    gm.team_master_tm_number,
    gm.gm_alliance, 
    gm.gm_alliance_position, 
    gm.frc_season_master_sm_year,
    tm.tm_name, 
    tms.tm_name,
    tms.api_rank,
    tms.nbr_games,
    tms.total_game_score_avg,
    tms.auton_algae_in_processor_avg,
    tms.auton_algae_in_net_avg,
    tms.auton_algae_dislodge_avg,
    tms.auton_coral_scored_avg,
    tms.auton_coral_scored_l1_avg,
    tms.auton_coral_scored_l2_avg,
    tms.auton_coral_scored_l3_avg,
    tms.auton_coral_scored_l4_avg,
    tms.auton_total_score_avg,
    tms.teleop_total_score_avg,
    tms.teleop_algae_in_processor_avg,
    tms.teleop_algae_in_net_avg,
    tms.teleop_coral_scored_avg,
    tms.teleop_coral_scored_l1_avg,
    tms.teleop_coral_scored_l2_avg,
    tms.teleop_coral_scored_l3_avg,
    tms.teleop_coral_scored_l4_avg,
    tms.total_algae_dislodge_avg,
    tms.total_foul_points_avg,
    tms.endgame_park_avg,
    tms.endgame_park_sum,
    tms.endgame_shallow_climb_avg,
    tms.endgame_shallow_climb_sum,
    tms.endgame_deep_climb_avg,
    tms.endgame_deep_climb_sum,
    tms.total_algae_dislodge_avg,
    tms.api_rank,
    tms.api_win,
    tms.api_loss,
    tms.api_rank,
    tms.api_tie,
    tms.api_dq,
    tms.api_dpr,
    tms.api_opr,
    tms.api_opr_rank ,
    tms.api_dpr_rank 
    FROM 
    teamsixn_scouting_dev.game_matchup gm
    LEFT JOIN
    teamsixn_scouting_dev.tmp_match_strategy tms
    ON 
    gm.frc_season_master_sm_year = tms.frc_season_master_sm_year AND
    gm.competition_master_cm_event_code = tms.competition_master_cm_event_code AND
    gm.gm_game_type = tms.game_matchup_gm_game_type AND
    gm.team_master_tm_number = tms.team_master_tm_number
    LEFT JOIN 
    teamsixn_scouting_dev.team_master tm 
    ON
    gm.team_master_tm_number  = tm.tm_number 
    WHERE 
    gm.frc_season_master_sm_year = ${gameConstants.YEAR} AND
    gm.competition_master_cm_event_code = ${gameConstants.COMP} AND
    gm.gm_game_type  = ${gameConstants.GAME_TYPE} AND
    gm.gm_number = ${gameNumber}
    ORDER BY 
    gm.frc_season_master_sm_year, 
        gm.competition_master_cm_event_code, 
        gm.gm_alliance DESC, 
        gm.gm_alliance_position ;`
}

async function getChartData() {
    await checkTempMatchStrategy()

    return SQL`
    SELECT *
        FROM
    teamsixn_scouting_dev.tmp_match_strategy
    WHERE
    frc_season_master_sm_year = ${gameConstants.YEAR} AND
    competition_master_cm_event_code = ${gameConstants.COMP} AND
    ( game_matchup_gm_game_type = ${gameConstants.GAME_TYPE});
    `

}

async function getTeamDetailsTeamData() {
    await checkTempMatchStrategy()

    return SQL`
    SELECT *
        FROM 
    teamsixn_scouting_dev.tmp_match_strategy
    WHERE
    frc_season_master_sm_year = ${gameConstants.YEAR} AND
    competition_master_cm_event_code = ${gameConstants.COMP} AND 
    game_matchup_gm_game_type = ${gameConstants.GAME_TYPE};`
}

function getTeamPictures(team) {
    return SQL`
    select 
        *
        from 
    teamsixn_scouting_dev.pit_scouting ps 
    WHERE
    frc_season_master_sm_year = ${gameConstants.YEAR} and 
    competition_master_cm_event_code = ${gameConstants.COMP} and 
    team_master_tm_number = ${team};
    `
}


function saveComment(comment, user_id, matchNumber, alliance, alliancePosition) {
    return SQL`INSERT INTO teamsixn_scouting_dev.game_comments
    (frc_season_master_sm_year, competition_master_cm_event_code, game_matchup_gm_game_type, game_matchup_gm_number, game_matchup_gm_alliance, game_matchup_gm_alliance_position, gc_comment, gc_um_id, gc_ts)
    VALUES(${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${matchNumber}, ${alliance}, ${alliancePosition}, ${comment}, ${user_id}, ${new Date()});`
}

function clearMatchStrategyTemp() {
    return SQL`DROP TABLE IF EXISTS teamsixn_scouting_dev.tmp_match_strategy;`
}


function getMatchComments(team) {
    return SQL`select 
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
    gc.competition_master_cm_event_code = ${gameConstants.COMP} and 
    gc.game_matchup_gm_game_type  = ${gameConstants.GAME_TYPE} and 
    gm.team_master_tm_number = ${team} and 
    trim(gc.gc_comment) <> "" `
}

function deleteMatchDataX ()
{
    const matchTableXSQL = `DELETE FROM teamsixn_scouting_dev.game_matchup_x`
    return matchTableXSQL
}

function addMatchData(matchInfo, matchTimes)
{
    let valuesStr = ""
    let counter = 0
    for (const [k, match] of Object.entries(matchInfo)) {
        counter++
        const match_str = String(k)
        const inRedAlliance = "R"
        const inBlueAlliance = "B"
        const Red = match.red
        const gametype = (gameConstants.GAME_TYPE == "qm" || gameConstants.GAME_TYPE == "Q")? "Q":""
        //console.log(matchTimes[k-1])
        for (let i = 0; i < 3; i++)
        {
            const team_num_str = String(Red[i])
            const alliance_position = String(i+1)
            let a = "(" + gameConstants.YEAR + ",'" + gameConstants.COMP + "','" + gametype + "'," + match_str + ",'" + inRedAlliance + "'," + alliance_position + "," + team_num_str + ", convert('"+String(`${matchTimes[k-1]}`)+"',datetime)),"
            //a = Object.keys(matchInfo).length != counter ? a + "," : a
            valuesStr += a
        }
        const Blue = match.blue
        for (let i = 0; i < 3; i++)
        {
            const team_num_str = String(Blue[i])
            const alliance_position = String(i+1)
            let a = "(" + gameConstants.YEAR + ",'" + gameConstants.COMP + "','" + gametype + "'," + match_str + ",'" + inBlueAlliance + "'," + alliance_position + "," + team_num_str + ", convert('"+String(`${matchTimes[k-1]}`)+"',datetime))"
            a = (Object.keys(matchInfo).length != counter || i != 2) ? a + "," : a
            //a = (i != 2) ? a + "," : a
            valuesStr += a
        }
    }
    const sqlStr =
        `INSERT INTO teamsixn_scouting_dev.game_matchup_x
    (frc_season_master_sm_year, competition_master_cm_event_code, gm_game_type, gm_number, gm_alliance, gm_alliance_position, team_master_tm_number, gm_timestamp)
    VALUES${valuesStr};`

    //console.log(sqlStr)
    return sqlStr

}

async function getScoutifyMatchData() {

        //for 2024
        // return await executeQuery(SQL `with score as
        //     (
        //         select
        //         frc_season_master_sm_year,
        //         competition_master_cm_event_code,
        //         game_matchup_gm_game_type,
        //         game_matchup_gm_number,
        //         game_matchup_gm_alliance,
        //         game_element_ge_key,
        //         case
        //         when game_element_ge_key in (301, 302) then '301+302'
        //         else
        //         cast(game_element_ge_key as char)
        //         end as ge_key_group,
        //         sum(gd_value) as gd_value,
        //         sum(gd_score) as gd_score
        //         FROM
        //         game_details gd
        //         where
        //         frc_season_master_sm_year = ${gameConstants.YEAR} and
        //         competition_master_cm_event_code = ${gameConstants.COMP} and
        //         game_matchup_gm_game_type = ${gameConstants.GAME_TYPE} and
        //         game_matchup_gm_alliance_position in (1, 2, 3) and
        //         game_element_ge_key in (210, 211, 301, 302, 303)
        //         group by
        //         frc_season_master_sm_year,
        //         competition_master_cm_event_code,
        //         game_matchup_gm_game_type,
        //         game_matchup_gm_number,
        //         game_matchup_gm_alliance,
        //         game_element_ge_key
        //     ),
        //     team_list as
        //     (
        //         SELECT
        //         gm.frc_season_master_sm_year ,
        //         gm.competition_master_cm_event_code ,
        //         gm.gm_game_type,
        //         gm.gm_number,
        //         gm.gm_alliance,
        //         GROUP_CONCAT(DISTINCT gm.team_master_tm_number order by gm.gm_alliance_position SEPARATOR ", ") as team_list
        //         FROM
        //         teamsixn_scouting_dev.game_matchup gm
        //         WHERE
        //         gm.frc_season_master_sm_year = ${gameConstants.YEAR} and
        //         gm.competition_master_cm_event_code = ${gameConstants.COMP} and
        //         gm.gm_game_type = ${gameConstants.GAME_TYPE}
        //         GROUP BY
        //         gm.frc_season_master_sm_year ,
        //         gm.competition_master_cm_event_code ,
        //         gm.frc_season_master_sm_year ,
        //         gm.gm_game_type,
        //         gm.gm_alliance,
        //         gm.gm_number
        //     ),
        //     user_list as
        //     (
        //         SELECT
        //         gd.frc_season_master_sm_year ,
        //         gd.competition_master_cm_event_code,
        //         gd.game_matchup_gm_game_type ,
        //         gd.game_matchup_gm_number ,
        //         gd.game_matchup_gm_alliance ,
        //         GROUP_CONCAT(DISTINCT gd.gd_um_id order by gd.game_matchup_gm_alliance_position SEPARATOR ", ") as user_list
        //         FROM
        //         teamsixn_scouting_dev.game_details gd
        //         WHERE
        //         gd.frc_season_master_sm_year = ${gameConstants.YEAR} and
        //         gd.competition_master_cm_event_code = ${gameConstants.COMP} and
        //         gd.game_matchup_gm_game_type = ${gameConstants.GAME_TYPE}
        //         GROUP BY
        //         gd.frc_season_master_sm_year ,
        //         gd.competition_master_cm_event_code ,
        //         gd.game_matchup_gm_game_type,
        //         gd.game_matchup_gm_alliance,
        //         gd.game_matchup_gm_number	
        //     )
        //     select
        //     s.frc_season_master_sm_year,
        //     s.competition_master_cm_event_code,
        //     s.game_matchup_gm_game_type,
        //     s.game_matchup_gm_number,
        //     s.game_matchup_gm_alliance,
        //     s.ge_key_group,
        //     t.team_list,
        //     u.user_list,
        //     sum(s.gd_value) as gd_value,
        //     sum(s.gd_score) as gd_score
        //     FROM
        //     score s
        //     left join
        //     team_list t
        //     on	s.frc_season_master_sm_year = t.frc_season_master_sm_year and
        //     s.competition_master_cm_event_code = t.competition_master_cm_event_code and
        //     s.game_matchup_gm_game_type = t.gm_game_type and
        //     s.game_matchup_gm_number = t.gm_number and
        //     s.game_matchup_gm_alliance = t.gm_alliance
        //     left join
        //     user_list u
        //     on	s.frc_season_master_sm_year = u.frc_season_master_sm_year and
        //     s.competition_master_cm_event_code = u.competition_master_cm_event_code and
        //     s.game_matchup_gm_game_type = u.game_matchup_gm_game_type and
        //     s.game_matchup_gm_number = u.game_matchup_gm_number and
        //     s.game_matchup_gm_alliance = u.game_matchup_gm_alliance
        //     where
        //     s.frc_season_master_sm_year = ${gameConstants.YEAR} and
        //     s.competition_master_cm_event_code = ${gameConstants.COMP} and
        //     s.game_matchup_gm_game_type = ${gameConstants.GAME_TYPE} and
        //     s.game_element_ge_key in (210, 211, 301, 302, 303)
        //     group by
        //     s.frc_season_master_sm_year,
        //     s.competition_master_cm_event_code,
        //     s.game_matchup_gm_game_type,
        //     s.game_matchup_gm_number,
        //     s.game_matchup_gm_alliance,
        //     s.ge_key_group,
        //     t.team_list,
        //     u.user_list;`)

        //for 2025
        return await executeQuery(SQL `with score as
        (
            select
                frc_season_master_sm_year,
                competition_master_cm_event_code,
                game_matchup_gm_game_type,
                game_matchup_gm_number,
                game_matchup_gm_alliance,
                game_element_ge_key,
                case
                    when game_element_ge_key in (21011, 21021, 21031, 21041, 21051, 21061, 21071, 21081, 21091, 21101, 21111, 21121) then 'Auton L1'
                    when game_element_ge_key in (22011, 22021, 22031, 22041, 22051, 22061, 22071, 22081, 22091, 22101, 22111, 22121) then 'Auton L2'
                    when game_element_ge_key in (23011, 23021, 23031, 23041, 23051, 23061, 23071, 23081, 23091, 23101, 23111, 23121) then 'Auton L3'
                    when game_element_ge_key in (24011, 24021, 24031, 24041, 24051, 24061, 24071, 24081, 24091, 24101, 24111, 24121) then 'Auton L4'
                    when game_element_ge_key in (31011, 31021, 31031, 31041, 31051, 31061, 31071, 31081, 31091, 31101, 31111, 31121) then 'Teleop L1'
                    when game_element_ge_key in (32011, 32021, 32031, 32041, 32051, 32061, 32071, 32081, 32091, 32101, 32111, 32121) then 'Teleop L2'
                    when game_element_ge_key in (33011, 33021, 33031, 33041, 33051, 33061, 33071, 33081, 33091, 33101, 33111, 33121) then 'Teleop L3'
                    when game_element_ge_key in (34011, 34021, 34031, 34041, 34051, 34061, 34071, 34081, 34091, 34101, 34111, 34121) then 'Teleop L4'
                    else cast(game_element_ge_key as char)
                end as ge_key_group,
                sum(gd_value) as gd_value,
                sum(gd_score) as gd_score
            FROM
                game_details gd
            where
                frc_season_master_sm_year = ${gameConstants.YEAR} and
                competition_master_cm_event_code = ${gameConstants.COMP} and
                game_matchup_gm_game_type = 'Q' and
                game_matchup_gm_alliance_position in (1, 2, 3)
            group by
                frc_season_master_sm_year,
                competition_master_cm_event_code,
                game_matchup_gm_game_type,
                game_matchup_gm_number,
                game_matchup_gm_alliance,
                game_element_ge_key
        ),
        team_list as
        (
        SELECT
            gm.frc_season_master_sm_year ,
            gm.competition_master_cm_event_code ,
            gm.gm_game_type,
            gm.gm_number,
            gm.gm_alliance,
            GROUP_CONCAT(DISTINCT gm.team_master_tm_number order by gm.gm_alliance_position SEPARATOR ", ") as team_list
        FROM
            teamsixn_scouting_dev.game_matchup gm
        WHERE
            gm.frc_season_master_sm_year = ${gameConstants.YEAR} and
            gm.competition_master_cm_event_code = ${gameConstants.COMP} and
            gm.gm_game_type = 'Q'
        GROUP BY
            gm.frc_season_master_sm_year ,
            gm.competition_master_cm_event_code ,
            gm.frc_season_master_sm_year ,
            gm.gm_game_type,
            gm.gm_alliance,
            gm.gm_number
        ),
        user_list as
        (
            SELECT
                gd.frc_season_master_sm_year ,
                gd.competition_master_cm_event_code,
                gd.game_matchup_gm_game_type ,
                gd.game_matchup_gm_number ,
                gd.game_matchup_gm_alliance ,
                GROUP_CONCAT(DISTINCT gd.gd_um_id order by gd.game_matchup_gm_alliance_position SEPARATOR ", ") as user_list
            FROM
                teamsixn_scouting_dev.game_details gd
            WHERE
                gd.frc_season_master_sm_year = ${gameConstants.YEAR} and
                gd.competition_master_cm_event_code = ${gameConstants.COMP} and
                gd.game_matchup_gm_game_type = 'Q'
            GROUP BY
                gd.frc_season_master_sm_year ,
                gd.competition_master_cm_event_code ,
                gd.game_matchup_gm_game_type,
                gd.game_matchup_gm_alliance,
                gd.game_matchup_gm_number
        )
        select
            s.frc_season_master_sm_year,
            s.competition_master_cm_event_code,
            s.game_matchup_gm_game_type,
            s.game_matchup_gm_number,
            s.game_matchup_gm_alliance,
            s.ge_key_group,
            t.team_list,
            u.user_list,
            sum(s.gd_value) as gd_value,
            sum(s.gd_score) as gd_score
        FROM
            score s
            left join
                team_list t
                on  s.frc_season_master_sm_year = t.frc_season_master_sm_year and
                        s.competition_master_cm_event_code = t.competition_master_cm_event_code and
                        s.game_matchup_gm_game_type = t.gm_game_type and
                        s.game_matchup_gm_number = t.gm_number and
                        s.game_matchup_gm_alliance = t.gm_alliance
            left join
                user_list u
                on  s.frc_season_master_sm_year = u.frc_season_master_sm_year and
                        s.competition_master_cm_event_code = u.competition_master_cm_event_code and
                        s.game_matchup_gm_game_type = u.game_matchup_gm_game_type and
                        s.game_matchup_gm_number = u.game_matchup_gm_number and
                        s.game_matchup_gm_alliance = u.game_matchup_gm_alliance
        where
            s.frc_season_master_sm_year = ${gameConstants.YEAR} and
            s.competition_master_cm_event_code = ${gameConstants.COMP} and
            s.game_matchup_gm_game_type = 'Q' and
            (s.ge_key_group like 'Auton%' or s.ge_key_group like 'Teleop%')
        group by
            s.frc_season_master_sm_year,
            s.competition_master_cm_event_code,
            s.game_matchup_gm_game_type,
            s.game_matchup_gm_number,
            s.game_matchup_gm_alliance,
            s.ge_key_group,
            t.team_list,
            u.user_list;`)
}

module.exports = {
    getMatchData: getMatchData,
    getGameNumbers: getGameNumbers,
    query: executeQuery,
    getTeams: getTeams,
    getMatchVerify: getMatchVerify,
    addMatchup: addMatchup,
    removeMatchup: removeMatchup,
    getCollectedData: getCollectedData,
    saveAutonPath: saveAutonPath,
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
    clearMatchStrategyTemp: clearMatchStrategyTemp,
    saveComment: saveComment,
    getMatchComments: getMatchComments,
    getSeventhScouter: getSeventhScouter,
    getRandomTeam: getRandomTeam,
    addMatchData: addMatchData,
    getTeamDetailsTeamData: getTeamDetailsTeamData,
    deleteMatchDataX: deleteMatchDataX,
    getScoutifyMatchData: getScoutifyMatchData,
    getScouter:getScouter,
}
