import { currentPage, paths, requestPage, consoleLog, requestData } from "./utility.js"
import * as graphHandler from "./graphHandler.js"


let data
let chart

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(async function (mutation) {
        for (const removed_node of mutation.removedNodes) {
            if (removed_node.id == 'page-holder' && currentPage == paths.matchStrategy) {
                main()
                break
            }
        }
    })
})

function sumParam(data, param) {
    let sum = 0
    for (const t of data) {
        sum += t[param] ? t[param] : 0
    }
    return sum
}


observer.observe(document.body, { subtree: false, childList: true });

async function main() {
    const select = document.getElementById("available-matches")
    const canvas = document.getElementById("spider-chart")
    const ctx = canvas.getContext("2d")
    select.onchange = () => {
        requestPage(paths.matchStrategy + "?match=" + select.value, {}, paths.matchStrategy)
    }

    data = JSON.parse(await requestData(paths.matchStrategy + "?getData=1&match=" + select.value))

    consoleLog("strat data:", data)

    const red = data.slice(0, 3)
    const blue = data.slice(3)
    
    consoleLog("BLUE:", blue)


    const config = await graphHandler.createSpiderChart(
        [
            {
                teamNumber: 0,
                teamName: "Red Alliance",
                color: "rgb(255,0,0)",
                hidden: false,
                autonNotes: sumParam(red, "auton_notes_amp_avg") + sumParam(red, "auton_notes_speaker_avg"),
                autonAmp: sumParam(red, "auton_notes_amp_avg"),
                autonSpeaker: sumParam(red, "auton_notes_speaker_avg"),
                gamesPlayed: sumParam(red, "nbr_games"),
                gameScore: sumParam(red, "total_game_score_avg"),
                teleopScore: sumParam(red, "teleop_total_score_avg"),
                rank: sumParam(red, "api_rank"),
                opr: sumParam(red, "api_opr")
            },
            {
                teamNumber: 1,
                teamName: "Blue Alliance",
                color: "rgb(0,0,255)",
                hidden: false,
                autonNotes: sumParam(blue, "auton_notes_amp_avg") + sumParam(red, "auton_notes_speaker_avg"),
                autonAmp: sumParam(blue, "auton_notes_amp_avg"),
                autonSpeaker: sumParam(blue, "auton_notes_speaker_avg"),
                gamesPlayed: sumParam(blue, "nbr_games"),
                gameScore: sumParam(blue, "total_game_score_avg"),
                teleopScore: sumParam(blue, "teleop_total_score_avg"),
                rank: sumParam(blue, "api_rank"),
                opr: sumParam(blue, "api_opr")
            }
        ],
        false
    )
    consoleLog("CONF:")
    consoleLog(config)
    chart = new Chart(ctx,
        config
    )
}
