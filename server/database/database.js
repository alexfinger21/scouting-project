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

    const sqlStr = SQL`INSERT INTO teamsixn_scouting_dev.api_rankings
    (
        frc_season_master_sm_year, 
        competition_master_cm_event_code, 
        team_master_tm_number, api_rank, 
        api_win, api_loss, api_tie, api_dq, 
        api_matches_played, api_opr, api_dpr, api_rank_ts) 
        VALUES ${valuesStr}
            ;`

    console.log(sqlStr)

    return sqlStr
}
function convertToInt(option) {
    switch (option) {
        case "source":
            return 0
        case "ground":
            return 1
        case "source-ground":
            return 2
        case "nowhere":
            return 0
        case "touching":
            return 1
        case "anywhere":
            return 2
        case "n/a":
            return 0
        case "not-parked":
            return 0
        case "parked":
            return 1
        case "on-stage":
            return 2
        case "harmony":
            return 3
        default:
            return 0
    }
}

function saveData(data, is7thScouter=false) {
    //console.log(data)
    const params =
        `${gameConstants.YEAR}, 
        ${gameConstants.COMP}, 
        ${gameConstants.GAME_TYPE}, 
        ${data.matchNumber}, 
        ${data.alliance},
        ${data.position},
        ${data.username}`

    let autonScoringStr = new String()
    let endgameScoringStr = new String()
    let autonPickedUp = data["Robot Preloaded"] ? 1 : 0
    console.log("PRELOAD: ", data["Robot Preloaded"])

    for (const [i, v] of Object.entries(data.gameData.autonPieceData)) {
        autonScoringStr += `(${gameConstants.YEAR}, '${gameConstants.COMP}', '${gameConstants.GAME_TYPE}', ${data.matchNumber}, '${data.alliance}', ${data.position}, '${data.username}', 2, ${i}, ${v}),`  
        if(v > 0) {
            autonPickedUp++
        }
    }

    console.log("AUTON PICKED UP:", autonPickedUp)

    for (const [i, v] of Object.entries(data.gameData.spotlights)) {
        autonScoringStr += `(${gameConstants.YEAR}, '${gameConstants.COMP}', '${gameConstants.GAME_TYPE}', ${data.matchNumber}, '${data.alliance}', ${data.position}, '${data.username}', 4,  ${i}, ${(v == 2 && i == (402 + data.gameData["Instage Location"])) ? 3 : v}),`  
    }


    console.log(autonScoringStr, endgameScoringStr, "SCORING STRINGS")
    //console.log(linkArray)
    
    //console.log("LINK COUNT: " + linkCount)

    //const sqlStr = SQL`INSERT INTO teamsixn_scouting_dev.${is7thScouter ? "7th_scouter_details": "game_details"} (
    
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
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 1, 101, ${data.gameData["Starting Location"]}), 
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 1, 102, ${data["Robot Preloaded"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 1, 201, ${data["robot-taxies"] ?? 0}),
        `.append(autonScoringStr).append(SQL`
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 210, ${data["auton-speaker"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 211, ${data["auton-amplifier"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 212, ${data["auton-tech-fouls"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 1, 213, ${autonPickedUp ?? 0}), 

        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 301, ${data["teleop-speaker"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 302, ${data["teleop-amplified-speaker"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 303, ${data["teleop-amplifier"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 4, 304, 0),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 305, ${data["coopertition-bonus-activated"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 4, 401, ${convertToInt(data["robot-in-stage"])}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 4, 402, ${data.gameData["Instage Location"]}),
        `).append(endgameScoringStr).append(SQL`
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 4, 406, ${data["trap"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 4, 407, ${data["human-player"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 501, ${convertToInt(data["intake-location"])}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 502, ${convertToInt(data["shot-location"])}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 503, ${convertToInt(data["speaker-location"])}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 504, ${data["fumbles-intake"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 505, ${data["fumbles-amplifier"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 506, ${data["fumbles-speaker"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 507, ${data["robot-tipped"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 508, ${data["robot-broke"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 509, ${data["robot-disabled"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 510, ${data["passed-under-stage"]}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 511, ${data["used-a-stop"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 512, ${data["foul-count"]}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 5, 513, ${data["tech-foul-count"]})
        ;`)

    console.log(sqlStr)

    return sqlStr
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

function getMatchData(gameNumber) {
    return SQL`
    SELECT 
        gm.team_master_tm_number,
        tm.tm_name, 
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

function getChartData() {
    return SQL`
    SELECT *
    FROM
        teamsixn_scouting_dev.v_match_summary vms 
    WHERE
        vms.frc_season_master_sm_year = ${gameConstants.YEAR} AND
        vms.competition_master_cm_event_code = ${gameConstants.COMP} AND
        ( vms.game_matchup_gm_game_type = ${gameConstants.GAME_TYPE} or vms.game_matchup_gm_game_type IS NULL);
    `
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

function executeQuery(sql, callback=false) {
    return new Promise((res, rej) => {
        pool.query(sql, function (error, results, fields) {
            if (error) {
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
                    console.log(res([null, results]))
                }
            }
        })
    })
}

function saveComment(comment, user_id, matchNumber, alliance, alliancePosition) {
    return SQL`INSERT INTO teamsixn_scouting_dev.game_comments
    (frc_season_master_sm_year, competition_master_cm_event_code, game_matchup_gm_game_type, game_matchup_gm_number, game_matchup_gm_alliance, game_matchup_gm_alliance_position, gc_comment, gc_um_id, gc_ts)
    VALUES(${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${matchNumber}, ${alliance}, ${alliancePosition}, ${comment}, ${user_id}, ${new Date()});`
}

function clearMatchStrategyTemp() {
    return SQL`DROP TABLE IF EXISTS teamsixn_scouting_dev.tmp_match_strategy;`
}

function saveMatchStrategy() {
    return SQL`CREATE TABLE teamsixn_scouting_dev.tmp_match_strategy AS
    SELECT
        *, 
        rank() OVER (ORDER BY api_opr desc) AS api_opr_rank, 
        rank() OVER (ORDER BY api_dpr desc) AS api_dpr_rank
    FROM 
        teamsixn_scouting_dev.v_match_team_score_avg_rankings vmtsar 
    where 
        frc_season_master_sm_year = ${gameConstants.YEAR} and 
        competition_master_cm_event_code = ${gameConstants.COMP} and 
        game_matchup_gm_game_type = ${gameConstants.GAME_TYPE} and 
        team_master_tm_number is not NULL;`
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
        gc.frc_season_master_sm_year = "${gameConstants.YEAR}" and 
        gc.competition_master_cm_event_code = "${gameConstants.COMP}" and 
        gc.game_matchup_gm_game_type  = "${gameConstants.GAME_TYPE}" and 
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
    clearMatchStrategyTemp: clearMatchStrategyTemp,
    saveComment: saveComment,
    getMatchComments: getMatchComments,
    getSeventhScouter: getSeventhScouter,
    getRandomTeam: getRandomTeam,
    addMatchData: addMatchData,
    deleteMatchDataX: deleteMatchDataX,
}
