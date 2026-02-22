import { currentPage, paths, requestPage, consoleLog, requestData, checkPage } from "./utility.js"
import * as graphHandler from "./graphHandler.js"


let data
let chart

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(async function (mutation) {
        for (const removed_node of mutation.removedNodes) {
            if (removed_node.id == 'page-holder' && checkPage(paths.matchStrategy)) {
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

function sumParams(data, ...params) {
    let sum = 0
    for (const t of data) {
        for(const p of params) {
            sum += t[p[0]] ? t[p[0]] * p[1] : 0
        }
    }
    return sum
}


observer.observe(document.body, { subtree: false, childList: true });

async function main() {
    console.log("hello")
    const select = document.getElementById("available-matches")
    const canvas = document.getElementById("spider-chart")
    const ctx = canvas.getContext("2d")
    select.onchange = () => {
        requestPage(paths.matchStrategy + "?match=" + select.value, {}, paths.matchStrategy)
    }

    for(const b of document.getElementsByClassName("help-button")) {
        b.addEventListener("click", () => {
            b.classList.toggle("active")
            for(const a of document.getElementsByClassName("help-button")) {
                if(b!=a) {

                    a.classList.remove("active")
                }
            }
        })
    }

    data = JSON.parse(await requestData(paths.matchStrategy + "?getData=1&match=" + select.value))

    consoleLog("strat data:", data)

    const red = data.slice(0, 3)
    const blue = data.slice(3)
    
    consoleLog("HELLO")
    const config = await graphHandler.createSpiderChart(
        [
            {
                teamNumber: 0,
                teamName: "Red Alliance",
                color: "rgb(255,0,0)",
                hidden: false,
                autonFuel: sumParam(red, "auton_fuel_score_avg"),
                autonClimb: sumParam(red, "auton_climb_attempt_avg"),
                teleopFuel: sumParam(red, "teleop_fuel_score_avg"),
                teleopClimb: sumParam(red, "endgame_climb_attempt_avg"),
                gamesPlayed: sumParam(red, "nbr_games"),
                defendingTime: sumParams(red, "teleop_defense_time_avg")/(140*3),
                //endgameScore: sumParams(red, ["endgame_park_avg", 2], ["endgame_shallow_climb_avg", 6], ["endgame_deep_climb_avg", 12]),
                dpr: sumParam(red, "api_dpr")
            },
            {
                teamNumber: 1,
                teamName: "Blue Alliance",
                color: "rgb(0,0,255)",
                hidden: false,
                autonFuel: sumParam(blue, "auton_fuel_score_avg"),
                autonClimb: sumParam(blue, "auton_climb_attempt_avg"),
                teleopFuel: sumParam(blue, "teleop_fuel_score_avg"),
                teleopClimb: sumParam(blue, "endgame_climb_attempt_avg"),
                gamesPlayed: sumParam(blue, "nbr_games"),
                defendingTime: sumParams(blue, "teleop_defense_time_avg")/(140*3),
                //endgameScore: sumParams(red, ["endgame_park_avg", 2], ["endgame_shallow_climb_avg", 6], ["endgame_deep_climb_avg", 12]),
                dpr: sumParam(blue, "api_dpr")
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
