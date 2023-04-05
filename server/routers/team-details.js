const database = require("../database/database.js")
const express = require("express")
const gameConstants = require("../game.js")
const router = express.Router()

router.get("/", function (req, res) { //only gets used if the url == team-details
    console.log("recieved")
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
            if(team == null) {
                if(team_results != null && team_results[0] != null) {
                    team = team_results[0].team_master_tm_number
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

                    database.query(database.getTeamPictures(2783), (err, pictures) => {
                        console.log(database.getTeamPictures(2783))
                        console.log("PICTURES:")
                        console.log(pictures)
                        let urls = []
                        for(let i = 0; i < 5; i++) {
                            const url = "https://drive.google.com/open?id=1L280dQrlsXQP9ZevCE_Js6D__f3bkwJT"
                            urls.push("https://drive.google.com/uc?export=view&id=" + url.split("id=").pop())
                        }
    
    
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