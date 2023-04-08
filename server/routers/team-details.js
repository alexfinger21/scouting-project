const database = require("../database/database.js")
const express = require("express")
const gameConstants = require("../game.js")
const { consoleLog } = require("../utility")
const router = express.Router()

router.get("/", function (req, res) { //only gets used if the url == team-details
    consoleLog("recieved")
    const start = Date.now()
    database.query(`SELECT 
        DISTINCT team_master_tm_number 
        FROM 
            teamsixn_scouting_dev.v_match_team_score vmts
        WHERE
            vmts.frc_season_master_sm_year = ${gameConstants.YEAR} AND
            vmts.competition_master_cm_event_code = '${gameConstants.COMP}' AND 
            vmts.game_matchup_gm_game_type = '${gameConstants.GAME_TYPE}';`,
        (err, team_results) => {
            let team = req.query.team
            if (team == null) {
                if (team_results != null && team_results[1] != null) {
                    team = team_results[1].team_master_tm_number
                }
                else {
                    team = 695
                }
            }
            database.query(`SELECT 
                * 
                FROM 
                    teamsixn_scouting_dev.v_match_team_score_cncb_count vmts
                WHERE
                    vmts.frc_season_master_sm_year = ${gameConstants.YEAR} AND
                    vmts.competition_master_cm_event_code = '${gameConstants.COMP}' AND 
                    vmts.game_matchup_gm_game_type = '${gameConstants.GAME_TYPE}' AND
                    vmts.team_master_tm_number = ${team};`,
                (err, results) => {
                    results = JSON.parse(JSON.stringify(results))
                    
                    consoleLog("TEAM: " + team)
                    
                    database.query(database.getTeamPictures(team), (err, pictures) => {
                        consoleLog("PICTURES")
                        consoleLog(pictures)
                        let urls = []
                        if(pictures.length > 0) {
                            for (let i = 0; i < pictures.length; i++) {
                                const url = pictures[i].ps_picture_full_robot
                                urls.push("https://drive.google.com/uc?export=view&id=" + url.split("id=").pop())
                            }
                        }
                        
                        consoleLog("the request took " + (Date.now() - start)/1000)
                        
                        res.render("team-details", {
                            teams: team_results.map(e => e.team_master_tm_number).sort((a, b) => a - b),
                            teamData: results.slice().sort((a, b) => a.game_matchup_gm_number - b.game_matchup_gm_number),
                            selectedTeam: team,
                            teamPictures: urls
                        })
                    })
                })
                
        })
})

router.post("/", function (req, res) {
    return res.send("req recieved")
})

module.exports = router