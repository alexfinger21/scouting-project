import {currentPage, paths, requestPage, consoleLog} from "./utility.js"

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        for (const removed_node of mutation.removedNodes) {
            if (removed_node.id == 'page-holder' && currentPage == paths.matchStrategy) {
                main()
                break
            }
        }
    })
})


async function getPoints(x, y, color) {
    consoleLog("gotten data")
    consoleLog("the data")
    consoleLog(data)

    let points = new Array(Array.from(data).length)
    let ind = 0
    for (const val of data) {
        let teamNumber = val.team_master_tm_number
        let gameTeams = getMatchTeams(document.getElementById("highlight-match").value)
        //consoleLog("GAME TEAMS:")
        //consoleLog(gameTeams)
        let color = POINT_COLOR
        let hidden = true
        if (teamNumber == document.getElementById("highlight-team").value) {
            color = HIGHTLIGHT_COLOR
            hidden = false
        }
        else if (gameTeams && (gameTeams.r1 == teamNumber || gameTeams.r2 == teamNumber || gameTeams.r3 == teamNumber)) {
            color = RED_COLOR
            hidden = false
        }
        else if (gameTeams && (gameTeams.b1 == teamNumber || gameTeams.b2 == teamNumber || gameTeams.b3 == teamNumber)) {
            color = BLUE_COLOR
            hidden = false
        }
        else if (highlightColors[val.team_master_tm_number]) {
            color = highlightColors[val.team_master_tm_number]
            hidden = false
        }
        points[ind] = {
            teamNumber: val.team_master_tm_number,
            hidden: hidden,
            teamName: val.tm_name,
            rank: val.api_rank,
            gamesPlayed: val.nbr_games,
            gameScore: val.total_game_score_avg,
            autonPickup: val.auton_notes_pickup_avg,
            autonSpeaker: val.auton_notes_speaker_avg,
            autonAmp: val.auton_notes_amp_avg,
            autonNotes: val.auton_notes_amp_avg + val.auton_notes_speaker_avg,
            autonUnused: Math.max(val.auton_notes_pickup_avg - val.auton_notes_amp_avg - val.auton_notes_speaker_avg, 0),
            autonScore: val.auton_notes_amp_avg * 2 + val.auton_notes_speaker_avg * 5,
            teleopScore: val.teleop_total_score_avg,
            teleopSpeakerAmped: val.teleop_notes_speaker_amped_avg,
            teleopSpeaker: val.teleop_notes_speaker_not_amped_avg,
            teleopAmp: val.teleop_notes_amp_avg,
            onstage: val.endgame_onstage_points_avg,
            rank: val.api_rank,
            opr: val.api_opr,
            x: val[x],
            y: val[y] ? val[y] : 0,
            color: color
        }
        ind++
    }
    return points
}


observer.observe(document.body, { subtree: false, childList: true });

function main() {
    const select = document.getElementById("available-matches")
    select.onchange = () => {
        consoleLog("\n\nSELECT VALUE\n" + select.value)
        consoleLog("REQUEST PAGE\n\n")
        requestPage(paths.matchStrategy + "?match=" + select.value + "&selectedPage=comments-page", {}, paths.matchStrategy)
    }

}
