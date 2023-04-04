import * as graphHandler from "./graphHandler.js"
import { paths, requestData, highlightColors} from "./utility.js"

const POINT_COLOR = "rgb(147, 157, 168)"
const OUR_TEAM_COLOR = "rgb(242, 142, 43)" 
const HIGHTLIGHT_COLOR = "rgb(158, 225, 87)"
const RED_COLOR = "rgb(225,87,89)"
const BLUE_COLOR = "rgb(52,146,234)"
const data = JSON.parse(await requestData(paths.teamSummary + "?getData=1"))

let debounce = false

let matchTeams = (await requestData("/getMatchTeams")).map((e) => {
    return {
        gm_number: e.gm_number,
        r1: e.r1_team_number,
        r2: e.r2_team_number,
        r3: e.r1_team_number,
        b1: e.b1_team_number,
        b2: e.b2_team_number,
        b3: e.r1_team_number,
    }
})


console.log(matchTeams)
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

function getMatchTeams(matchNum) {
    return matchTeams[matchNum]
}

async function getPoints(x, y, color) {
    console.log("gotten data")
    console.log("the data")
    //console.log(data)

    let points = new Array(Array.from(data).length)
    let ind = 0
    for (const val of data) {
        let teamNumber = val.team_master_tm_number
        let gameTeams = getMatchTeams(document.getElementById("highlight-match").value)
        console.log("GAME TEAMS:")
        console.log(gameTeams)
        let color = POINT_COLOR
        if(teamNumber == document.getElementById("highlight-team").value) {
            color = HIGHTLIGHT_COLOR
        }
        else if(gameTeams && (gameTeams.r1 == teamNumber || gameTeams.r2 == teamNumber || gameTeams.r3 == teamNumber) ) {
            color = RED_COLOR
        }
        else if(gameTeams && (gameTeams.b1 == teamNumber || gameTeams.b2 == teamNumber || gameTeams.b3 == teamNumber) ) {
            color = BLUE_COLOR
        }
        else if(highlightColors[val.team_master_tm_number]) {
            color = highlightColors[val.team_master_tm_number]
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
        const oldCurrentChart = currentChart

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

                if (oldCurrentChart == currentChart) { 
                    chart = new Chart(ctx,
                        graphHandler.createScatterChart(
                            points,
                            "FRC Rank", //x axis title
                            "Avg Score" //y axis title
                        )
                    )
                }
                break
            case 1:
                scatterPlotCanvas.setAttribute("hidden", "hidden")
                barGraphCanvas.removeAttribute("hidden")

                ctx = barGraphCanvas.getContext("2d")
                points = await getPoints("team_master_tm_number", "avg_gm_score", POINT_COLOR)

                if (oldCurrentChart == currentChart) { 
                    points.sort(function (a, b) { return b.gameScore - a.gameScore })
                    chart = new Chart(ctx,
                        graphHandler.createBarGraph(
                            points,
                            "gameScore",
                            15
                        )
                    )
                }
                break
            case 2:
                scatterPlotCanvas.setAttribute("hidden", "hidden")
                barGraphCanvas.removeAttribute("hidden")

                ctx = barGraphCanvas.getContext("2d")
                points = await getPoints("team_master_tm_number", "avg_gm_score", POINT_COLOR)

                if (oldCurrentChart == currentChart) { 
                    points.sort(function (a, b) { return b.links - a.links })
                    chart = new Chart(ctx,
                        graphHandler.createBarGraph(
                            points,
                            "links",
                            1
                        )
                    )
                }
                break
            case 3:
                scatterPlotCanvas.setAttribute("hidden", "hidden")
                barGraphCanvas.removeAttribute("hidden")

                ctx = barGraphCanvas.getContext("2d")
                points = await getPoints("team_master_tm_number", "avg_auton_chg_station_score", POINT_COLOR)

                if (oldCurrentChart == currentChart) { 
                    points.sort(function (a, b) { return b.autoDocking - a.autoDocking })
                    console.log("GARAh")
                    chart = new Chart(ctx,
                        graphHandler.createBarGraph(
                            points,
                            "autoDocking",
                            1.2
                        )
                    )
                }
                break
            case 4:
                scatterPlotCanvas.setAttribute("hidden", "hidden")
                barGraphCanvas.removeAttribute("hidden")

                ctx = barGraphCanvas.getContext("2d")
                points = await getPoints("team_master_tm_number", "avg_endgame_chg_station_score", POINT_COLOR)

                if (oldCurrentChart == currentChart) { 
                    points.sort(function (a, b) { return b.endgameDocking - a.endgameDocking })
                    chart = new Chart(ctx,
                        graphHandler.createBarGraph(
                            points,
                            "endgameDocking",
                            1
                        )
                    )
                }
                break
            case 5:
                scatterPlotCanvas.setAttribute("hidden", "hidden")
                barGraphCanvas.removeAttribute("hidden")

                ctx = barGraphCanvas.getContext("2d")
                points = await getPoints("team_master_tm_number", "games_played", POINT_COLOR)
                
                if (oldCurrentChart == currentChart) { 
                    points.sort(function (a, b) { return b.gamesPlayed - a.gamesPlayed })
                    chart = new Chart(ctx,
                        graphHandler.createBarGraph(
                            points,
                            "gamesPlayed",
                            3
                        )
                    )
                }
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

    //update graph when highlight team value changes
    const highlightTeam = document.getElementById("highlight-team")
    highlightTeam.addEventListener("change", (event) => {
        //update
        if (chart) {
            chart.destroy()
        }
        drawChart(currentChart)
    })

    const highlightMatch = document.getElementById("highlight-match")
    highlightMatch.addEventListener("change", (event) => {
        //update
        if (chart) {
            chart.destroy()
        }
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

