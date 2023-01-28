const pool = require('./dbconfig')                  

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

function executeQuery(sql, callback) {
    pool.query(sql, function (error, results, fields) {
        if (error) {
            return callback(error, null)
        }else{
            return callback(null, results)
        } 
    })
}

module.exports = {
    query: executeQuery,
    getTeams: getTeams
}