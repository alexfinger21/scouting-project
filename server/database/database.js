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
    //console.log(teamRankings)

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
    const params =
        `${gameConstants.YEAR}, 
        ${gameConstants.COMP}, 
        ${gameConstants.GAME_TYPE}, 
        ${data.matchNumber}, 
        ${data.alliance},
        ${data.position},
        ${data.username}`

    
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
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 1, 102, ${data["preloaded"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 1, 201, ${data["robot-taxies"] ?? 0}),
        `.append(autonScoringStr).append(SQL`
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 210, ${data["auton-speaker"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 211, ${data["auton-amplifier"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 212, ${data["auton-tech-fouls"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 2, 213, ${autonPickedUp ?? 0}), 

        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 3, 302, ${data["teleop-amplified-speaker"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 3, 301, ${data["teleop-speaker"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 3, 303, ${data["teleop-amplifier"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 3, 304, 0),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 3, 305, ${data["coopertition-bonus-activated"] ?? 0}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 4, 401, ${convertToInt(data["robot-in-stage"])}),
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 4, 402, ${data.gameData["Instage Location"]}),
        `).append(endgameScoringStr).append(SQL`
        (${gameConstants.YEAR}, ${gameConstants.COMP}, ${gameConstants.GAME_TYPE}, ${data.matchNumber}, ${data.alliance}, ${data.position}, ${data.username}, 4, 406, ${data["trap-notes"] ?? 0}),
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
    return SQL`CREATE TABLE teamsixn_scouting_dev.tmp_match_strategy AS
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

function checkTempMatchStrategy() {
    return new Promise(async (res, rej) => {
        let [err1, checkCreated] = await executeQuery(SQL`SHOW TABLES LIKE 'tmp_match_strategy'`)
        
        if (checkCreated?.length < 1) {
            await executeQuery(saveMatchStrategy())
        }

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
        tms.nbr_games,
        tms.total_game_score_avg,
        tms.auton_total_score_avg,
        tms.auton_notes_amp_avg,
        tms.auton_notes_speaker_avg,
        tms.auton_notes_pickup_avg,
        tms.teleop_total_score_avg,
        tms.teleop_notes_amp_avg,
        tms.teleop_notes_speaker_not_amped_avg,
        tms.teleop_notes_speaker_amped_avg,
        tms.teleop_notes_amp_avg,
        tms.teleop_coop_button_press_avg,
        tms.teleop_notes_acquired_avg,
        tms.endgame_notes_trap_avg,
        tms.endgame_onstage_points_avg,
        tms.endgame_high_notes_avg,
        tms.endgame_total_score_avg,
        tms.api_rank,
        tms.api_win,
        tms.api_loss,
        tms.api_rank,
        tms.api_tie,
        tms.api_dq,
        tms.api_dpr,
        tms.api_opr,
        tms.intake_location,
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
        teamsixn_scouting_dev.v_match_summary_api vmsa
    WHERE
        vmsa.frc_season_master_sm_year = ${gameConstants.YEAR} AND
        vmsa.competition_master_cm_event_code = ${gameConstants.COMP} AND
        ( vmsa.game_matchup_gm_game_type = ${gameConstants.GAME_TYPE} or vmsa.game_matchup_gm_game_type IS NULL);
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
    /*
    return await executeQuery(SQL `select
	frc_season_master_sm_year, 
	competition_master_cm_event_code, 
	game_matchup_gm_game_type, 
	game_matchup_gm_number, 
	game_matchup_gm_alliance, 
	game_element_ge_key, 
	sum(gd_value) as gd_value, 
	sum(gd_score) as gd_score
FROM 
	game_details gd 
		
where frc_season_master_sm_year = ${gameConstants.YEAR} and 
			competition_master_cm_event_code = ${gameConstants.COMP} and 
			game_matchup_gm_game_type = ${gameConstants.GAME_TYPE} and 
			game_matchup_gm_alliance_position in (1, 2, 3) and 
			game_element_ge_key in (210, 211, 301, 302, 303)
group by 
	frc_season_master_sm_year, 
	competition_master_cm_event_code, 
	game_matchup_gm_game_type, 
	game_matchup_gm_number, 
	game_matchup_gm_alliance, 
	game_element_ge_key;`)
    */

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
            when game_element_ge_key in (301, 302) then '301+302'
        else
            cast(game_element_ge_key as char)
        end as ge_key_group,
        sum(gd_value) as gd_value,
        sum(gd_score) as gd_score
        FROM
        game_details gd
        where
            frc_season_master_sm_year = ${gameConstants.YEAR} and
        competition_master_cm_event_code = ${gameConstants.COMP} and
        game_matchup_gm_game_type = ${gameConstants.GAME_TYPE} and
        game_matchup_gm_alliance_position in (1, 2, 3) and
        game_element_ge_key in (210, 211, 301, 302, 303)
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
            gm.gm_game_type = ${gameConstants.GAME_TYPE}
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
            gd.game_matchup_gm_game_type = ${gameConstants.GAME_TYPE}
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
        on	s.frc_season_master_sm_year = t.frc_season_master_sm_year and
                s.competition_master_cm_event_code = t.competition_master_cm_event_code and
                s.game_matchup_gm_game_type = t.gm_game_type and
                s.game_matchup_gm_number = t.gm_number and
                s.game_matchup_gm_alliance = t.gm_alliance
        left join
            user_list u
            on	s.frc_season_master_sm_year = u.frc_season_master_sm_year and
                s.competition_master_cm_event_code = u.competition_master_cm_event_code and
                s.game_matchup_gm_game_type = u.game_matchup_gm_game_type and
                s.game_matchup_gm_number = u.game_matchup_gm_number and
                s.game_matchup_gm_alliance = u.game_matchup_gm_alliance
    where
        s.frc_season_master_sm_year = ${gameConstants.YEAR} and
    s.competition_master_cm_event_code = ${gameConstants.COMP} and
    s.game_matchup_gm_game_type = ${gameConstants.GAME_TYPE} and
    s.game_element_ge_key in (210, 211, 301, 302, 303)
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
}
