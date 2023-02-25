import * as graphHandler from "./graphHandler.js"
import { paths } from "./utility.js"

const POINT_COLOR = "rgb(81, 121, 167)"
const HIGHTLIGHT_COLOR = "rgb(81, 121, 167)"

let debounce = false

//When teamsummary is loaded, call the main function 
const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (removed_node) {
            if (removed_node.id == 'page-holder') {
                main()
                debounce = false
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
        let color = POINT_COLOR
        if(val.team_master_tm_number == 695) {
            console.log("I LOVE 695!!")
            color = HIGHTLIGHT_COLOR
        }
        points[ind] = {
            teamNumber: val.team_master_tm_number,
            teamName: val.tm_name,
            rank: val.api_rank,
            gamesPlayed: val.games_played,
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

function updateMarker(oldval, newval) {
    const container = document.querySelector("#graph-display-container")
    console.log(container)

    if (debounce) {return}
    
    Array.from(container.children).forEach(e => {
        if (oldval != null && e.name == oldval) {
            e.style.backgroundColor = "#efefef"
            e.style.color = "#212121"
        } else if (e.name == newval) {
            e.style.backgroundColor = "#5179a8"
            e.style.color = "#ffffff"
        }
    })
}

function main() {
    let chart
    let currentChart = 0 //goes from 0 to 5
    let points


    const chartAreaWrapper = document.getElementById("chart-area-wrapper")
    const scatterPlotCanvas = document.getElementById("scatterplot-chart")
    const barGraphCanvas = document.getElementById("bar-graph-chart")
    let ctx

    async function drawChart(number) {
        if (debounce) { return }

        debounce = true
        //create chart based off of number
        console.log(number)
        switch (number) {
            case 0:
                barGraphCanvas.setAttribute("hidden", "hidden")
                scatterPlotCanvas.removeAttribute("hidden")
                ctx = scatterPlotCanvas.getContext("2d")
                points = await getPoints("api_rank", "avg_gm_score")
                chart = new Chart(ctx,
                    graphHandler.createScatterChart(
                        points,
                        "FRC Rank", //x axis title
                        "Avg Score" //y axis title
                    )
                )
                break
            case 1:
                scatterPlotCanvas.setAttribute("hidden", "hidden")
                barGraphCanvas.removeAttribute("hidden")

                ctx = barGraphCanvas.getContext("2d")
                points = await getPoints("team_master_tm_number", "avg_gm_score", "rgb(81, 121, 167)")
                points.sort(function (a, b) { return b.gameScore - a.gameScore })
                chart = new Chart(ctx,
                    graphHandler.createBarGraph(
                        points,
                        "gameScore",
                        20
                    )
                )
                break
            case 2:
                scatterPlotCanvas.setAttribute("hidden", "hidden")
                barGraphCanvas.removeAttribute("hidden")

                ctx = barGraphCanvas.getContext("2d")
                points = await getPoints("team_master_tm_number", "avg_gm_score", "rgb(81, 121, 167)")
                points.sort(function (a, b) { return b.links - a.links })
                chart = new Chart(ctx,
                    graphHandler.createBarGraph(
                        points,
                        "links",
                        1
                    )
                )
                break
            case 3:
                scatterPlotCanvas.setAttribute("hidden", "hidden")
                barGraphCanvas.removeAttribute("hidden")

                ctx = barGraphCanvas.getContext("2d")
                points = await getPoints("team_master_tm_number", "avg_auton_chg_station_score", "rgb(81, 121, 167)")
                points.sort(function (a, b) { return b.autoDocking - a.autoDocking })
                console.log("GARAh")
                chart = new Chart(ctx,
                    graphHandler.createBarGraph(
                        points,
                        "autoDocking",
                        3
                    )
                )
                break
            case 4:
                scatterPlotCanvas.setAttribute("hidden", "hidden")
                barGraphCanvas.removeAttribute("hidden")

                ctx = barGraphCanvas.getContext("2d")
                points = await getPoints("team_master_tm_number", "avg_endgame_chg_station_score", "rgb(81, 121, 167)")
                points.sort(function (a, b) { return b.endgameDocking - a.endgameDocking })
                chart = new Chart(ctx,
                    graphHandler.createBarGraph(
                        points,
                        "endgameDocking",
                        3
                    )
                )
                break
            case 5:
                scatterPlotCanvas.setAttribute("hidden", "hidden")
                barGraphCanvas.removeAttribute("hidden")

                ctx = barGraphCanvas.getContext("2d")
                points = await getPoints("team_master_tm_number", "games_played", "rgb(81, 121, 167)")
                points.sort(function (a, b) { return b.gamesPlayed - a.gamesPlayed })
                chart = new Chart(ctx,
                    graphHandler.createBarGraph(
                        points,
                        "gamesPlayed",
                        3
                    )
                )
                break
        }

        debounce = false
    }

    //variable stores currently selected chart
    //initialize to scatterchart
    updateMarker(null, currentChart)
    drawChart(currentChart)

    const arrowLeft = document.getElementById("arrow-left")
    arrowLeft.addEventListener("click", async () => {
        if (debounce) { return }

        if (chart) {
            chart.destroy()
        }

        const old = currentChart

        currentChart = currentChart == 0 ? 5 : currentChart - 1

        updateMarker(old, currentChart)

        drawChart(currentChart)
    })

    //when the arrows are clicked, draw a new graph
    const arrowRight = document.getElementById("arrow-right")
    arrowRight.addEventListener("click", async () => {
        if (debounce) { return }

        console.log("click")
        if (chart) {
            chart.destroy()
        }
        //increment currentChart
        const old = currentChart

        currentChart = currentChart == 5 ? 0 : currentChart + 1

        updateMarker(old, currentChart)

        drawChart(currentChart)
    })

    const topButtonsContainer = document.querySelector("#graph-display-container")

    for (const button of topButtonsContainer.children) {
        button.addEventListener("click", () => {
            if (debounce) { return }
            if (button.name != currentChart) {
                if (chart) {
                    chart.destroy()
                }
                updateMarker(currentChart, button.name)
                currentChart = Number(button.name)
                drawChart(currentChart)
                console.log("top btn clickd")
            }
        })
    }
}

