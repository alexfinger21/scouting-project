import * as graphHandler from "./graphHandler.js"
import { paths } from "./utility.js"

//When teamsummary is loaded, call the main function 
const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (removed_node) {
            if (removed_node.id == 'page-holder') {
                main()
            }
        })
    })
})

observer.observe(document.body, { subtree: false, childList: true });
window.addEventListener("load", main)

function requestData(url, data) {
    return new Promise(resolve => {
        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: url,
            data: JSON.stringify(data),
            success: function (response) {
                resolve(JSON.parse(response))
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error\n" + errorThrown, jqXHR)
            },
        })
    })
}


async function getPoints(x, y, color) {
    const data = await requestData(paths.teamSummary + "?getData=1")

    let points = new Array(Array.from(data).length)
    let ind = 0
    for (const val of data) {
        points[ind] = {
            teamNumber: val.team_master_tm_number,
            teamName: val.tm_name,
            rank: val.api_rank,
            gameScore: val.avg_gm_score,
            links: val.avg_nbr_links,
            autoDocking: val.avg_auton_chg_station_score,
            endgameDocking: val.avg_endgame_chg_station_score,
            x: val[x],
            y: val[y] ? val[y] : 0,
            color: color
        }
        ind++
    }
    return points
}


function main() {
    let chart
    let currentChart = 0 //goes from 0 to 5
    const ctx = document.getElementById("team-summary-chart").getContext("2d")
    const graphHolder = document.getElementById("graph-holder")
    let points

    async function drawChart(number) {
        //create chart based off of number
        switch(number) {
            case 0:
                graphHolder.style.height = "50vh"
                points = await getPoints("team_master_tm_number", "avg_nbr_links", "rgb(81, 121, 167)")
                chart = new Chart(ctx, 
                    graphHandler.createScatterChart(
                        points,
                        "FRC Rank", //x axis title
                        "Avg Score" //y axis title
                    )
                )
                break;
            case 1:
                graphHolder.style.height = "80vh"
                points = await getPoints("api_rank", "avg_gm_score", "rgb(81, 121, 167)")
                points.sort(function(a, b) {return b.links - a.links})
                chart = new Chart(ctx, 
                    graphHandler.createBarGraph(
                        points,
                        "Avg Links", //x axis title
                        "Team Number" //y axis title
                    )
                )
        }
    }

    //variable stores currently selected chart
    //initialize to scatterchart
    drawChart(currentChart)

    //when the arrows are clicked, draw a new graph
    const arrowLeft = document.getElementById("arrow-left")
    arrowLeft.addEventListener("click", async () => {
        if(chart) {
            chart.destroy()
        }
        //increment currentChart
        if(currentChart == 5) {
            currentChart = 0
            return
        }
        currentChart++
        drawChart(currentChart)
    })

    //when the arrows are clicked, draw a new graph
    const arrowRight = document.getElementById("arrow-right")
    arrowRight.addEventListener("click", async () => {
        if(chart) {
            chart.destroy()
        }
        //increment currentChart
        if(currentChart == 5) {
            currentChart = 0
            return
        }
        currentChart--
        drawChart(currentChart)
    })
}

