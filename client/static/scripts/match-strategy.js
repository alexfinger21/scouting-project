import { currentPage, paths, requestPage, consoleLog, requestData, checkPage } from "./utility.js"
import { getTeamProperties } from "./team-summary.js"
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


	data = data.map(i => getTeamProperties(i))

    const red = data.slice(0, 3)
    const blue = data.slice(3)
    
    const config = await graphHandler.createSpiderChart(
        [
            {
                teamNumber: 0,
                teamName: "Red Alliance",
                color: "rgb(255,0,0)",
                hidden: false,
                teleopStockpilingTimeAvg: sumParam(red, "teleopStockpilingTimeAvg"),
                defensiveEffect: sumParam(red, "defensiveEffect"),
                totalClimbScoreAvg: sumParam(red, "totalClimbScoreAvg"),
                totalFuelScoreAvg: sumParam(red, "totalFuelScoreAvg"),
                reliabilityIndex: sumParam(red, "reliabilityIndex"),
                defenseResistance: sumParam(red, "defenseResistance"),
            },
            {
                teamNumber: 1,
                teamName: "Blue Alliance",
                color: "rgb(0,0,255)",
                hidden: false,
                teleopStockpilingTimeAvg: sumParam(blue, "teleopStockpilingTimeAvg"),
                defensiveEffect: sumParam(blue, "defensiveEffect"),
                totalClimbScoreAvg: sumParam(blue, "totalClimbScoreAvg"),
                totalFuelScoreAvg: sumParam(blue, "totalFuelScoreAvg"),
                reliabilityIndex: sumParam(blue, "reliabilityIndex"),
                defenseResistance: sumParam(blue, "defenseResistance"),
            }
        ],
        false
    )
       chart = new Chart(ctx,
        config
    )
}
