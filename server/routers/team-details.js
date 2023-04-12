const database = require("../database/database.js")
const express = require("express")
const gameConstants = require("../game.js")
const { consoleLog } = require("../utility")
const router = express.Router()

function mergeDicts(dict1, dict2) {
    if (dict1 && dict2) {
        for(const [key, value] of Object.entries(dict2)) {
            dict1[key] = value
        }
    }
    
    return dict1
}

router.get("/", function (req, res) { //only gets used if the url == team-details
    consoleLog("recieved")
    const start = Date.now()
    database.query(`SELECT 
        *
        FROM 
            teamsixn_scouting_dev.tmp_match_strategy
        WHERE
            frc_season_master_sm_year = ${gameConstants.YEAR} AND
            competition_master_cm_event_code = '${gameConstants.COMP}' AND 
            game_matchup_gm_game_type = '${gameConstants.GAME_TYPE}';`,
        (err, team_results) => {
            team_results = JSON.parse(JSON.stringify(team_results))
            const teamNumber = req.query.team || 695
            const selectedPage = req.query.selectedPage || "game-data-page"
            consoleLog("SELECTED PAGE: " + selectedPage)

            let teamInfo = team_results.find(element => element.team_master_tm_number == teamNumber)
            
            database.query(`SELECT 
                * 
                FROM 
                    teamsixn_scouting_dev.v_match_team_score_cncb_count vmts
                WHERE
                    vmts.frc_season_master_sm_year = ${gameConstants.YEAR} AND
                    vmts.competition_master_cm_event_code = '${gameConstants.COMP}' AND 
                    vmts.game_matchup_gm_game_type = '${gameConstants.GAME_TYPE}' AND
                    vmts.team_master_tm_number = ${teamNumber};`,
                (err, results) => {
                    results = JSON.parse(JSON.stringify(results))
                    
                    consoleLog("TEAM: " + teamNumber)
                    
                    database.query(database.getTeamPictures(teamNumber), (err, pictures) => {
                        consoleLog("PICTURES")
                        consoleLog(pictures)

                        pictures = JSON.parse(JSON.stringify(pictures))
                        consoleLog("PICTURES: ")
                        consoleLog(pictures[0])
                        let urls = []
                        if(pictures.length > 0) {
                            teamInfo = mergeDicts(teamInfo, pictures[0])
                            consoleLog("MERGED: ")
                            consoleLog(teamInfo)
                            urls.push("https://drive.google.com/uc?export=view&id=" + teamInfo.ps_picture_full_robot.split("id=").pop())
                            urls.push("https://drive.google.com/uc?export=view&id=" + teamInfo.ps_picture_drivetrain.split("id=").pop())
                        }

                        consoleLog("URL: ")
                        consoleLog(urls)

                        database.query(database.getMatchComments(teamNumber), (err, comments) => {
                            comments = JSON.parse(JSON.stringify(comments))

                            consoleLog("COMMENTS: ")
                            consoleLog(comments)

                            consoleLog("the request took " + (Date.now() - start)/1000)
                        
                            res.render("team-details", {
                                teams: team_results.map(e => e.team_master_tm_number).sort((a, b) => a - b),
                                teamData: results.slice().sort((a, b) => a.game_matchup_gm_number - b.game_matchup_gm_number),
                                teamInfo: teamInfo,
                                selectedTeam: teamNumber,
                                teamPictures: urls,
                                comments: comments,
                                selectedPage: selectedPage
                            })
                        })
                    })
                })
                
        })
})

router.post("/", function (req, res) {
    return res.send("req recieved")
})

module.exports = router