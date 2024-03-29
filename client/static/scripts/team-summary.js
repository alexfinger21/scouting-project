import * as graphHandler from "./graphHandler.js"
import { paths, requestData, highlightColors, currentPage, consoleLog } from "./utility.js"

const POINT_COLOR = "rgb(147, 157, 168)"
const HIGHTLIGHT_COLOR = "rgb(158, 225, 87)"
const RED_COLOR = "rgb(225,87,89)"
const BLUE_COLOR = "rgb(52,146,234)"
let data = { 0: "dummy data" }

let debounce = false

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(async function (mutation) {
        consoleLog("Hello from mutation observer")
        for (const removed_node of mutation.removedNodes) {
            consoleLog("hey")
            if (removed_node.id == 'page-holder' && currentPage == paths.teamSummary) {
                consoleLog("hello from removed node")
                data = JSON.parse(await requestData(paths.teamSummary + "?getData=1"))
                consoleLog(data)
                main()
                debounce = false
                break
            }
        }
    })
})

observer.observe(document.body, { subtree: false, childList: true });

let matchTeams = (await requestData("/getMatchTeams")).map((e) => {
    return {
        gm_number: e.gm_number,
        r1: e.r1_team_number,
        r2: e.r2_team_number,
        r3: e.r3_team_number,
        b1: e.b1_team_number,
        b2: e.b2_team_number,
        b3: e.b3_team_number,
    }
})

consoleLog("\n\nMATCH TEAMS")
consoleLog(matchTeams)
//When teamsummary is loaded, call the main function 


function getMatchTeams(matchNum) {
    return matchTeams.find(match => match.gm_number == matchNum)
}

async function getPoints(x, y, color) {
    /*consoleLog("gotten data")
    consoleLog("the data")
    consoleLog(data)*/

    let points = []
    const gameTeams = getMatchTeams(document.getElementById("highlight-match").value)
    let noVal = 0
    let ind = 0

    for (const val of data) {
        let teamNumber = val.team_master_tm_number
        if (teamNumber && val.tm_name) {
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

            if (!val[x]) {
                ++noVal
            }

            points.push({
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
                endgameScore: val.endgame_total_score_avg,
                rank: val.api_rank ?? 0,
                opr: val.api_opr ?? 0,
                dpr: val.api_dpr ?? 0,
                x: val[x],
                y: val[y] ? val[y] : 0,
                color: color
            })
            ind++
        }
    }

    if (noVal == points.length) {return false;}

    return points
}

function updateMarker(oldval, newval) {
    const container = document.getElementById("graph-display-container")
    consoleLog(container)

    if (debounce) { return }

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

async function main() {
    let chart
    let currentChart = 0 //goes from 0 to 5
    let points


    const chartAreaWrapper = document.getElementById("chart-area-wrapper")
    const scatterPlotCanvas = document.getElementById("scatterplot-chart")
    const barGraphCanvas = document.getElementById("bar-graph-chart")
    const spiderCanvas = document.getElementById("spider-chart")
    const arrowLeft = document.getElementById("arrow-left")
    const arrowRight = document.getElementById("arrow-right")
    let ctx

    function switchChart(newChart) {
        consoleLog("Switch to", newChart)
        if (chart) {
            chart.destroy()
        }
        switch (newChart) {
            case "scatter":
                scatterPlotCanvas.removeAttribute("hidden")
                scatterPlotCanvas.removeAttribute("style")
                barGraphCanvas.setAttribute("hidden", "hidden")
                barGraphCanvas.setAttribute("style", "display: hidden !important")
                spiderCanvas.setAttribute("hidden", "hidden")
                spiderCanvas.setAttribute("style", "display: hidden !important")
                ctx = scatterPlotCanvas.getContext("2d")
                break
            case "bar":
                scatterPlotCanvas.setAttribute("hidden", "hidden")
                scatterPlotCanvas.setAttribute("style", "display: hidden !important")
                barGraphCanvas.removeAttribute("hidden")
                barGraphCanvas.removeAttribute("style")
                spiderCanvas.setAttribute("hidden", "hidden")
                spiderCanvas.setAttribute("style", "display: hidden !important")
                ctx = barGraphCanvas.getContext("2d")
                barGraphCanvas.height = Math.round(350 * chartAreaWrapper.clientHeight / chartAreaWrapper.clientWidth)
                break
            case "spider":
                scatterPlotCanvas.setAttribute("hidden", "hidden")
                scatterPlotCanvas.setAttribute("style", "display: hidden !important")
                barGraphCanvas.setAttribute("hidden", "hidden")
                barGraphCanvas.setAttribute("style", "display: hidden !important")
                spiderCanvas.removeAttribute("hidden")
                spiderCanvas.removeAttribute("style")
                console.trace()
                ctx = spiderCanvas.getContext("2d")
                break
        }
    }


    async function drawChart(number) {
        consoleLog("DRAW CHART:", number)
        const oldCurrentChart = currentChart


        if (debounce) { return }

        debounce = true
        //create chart based off of number
        consoleLog(number)
        switch (number) {
            case 0:
                switchChart("scatter")
                ctx = scatterPlotCanvas.getContext("2d")
                points = await getPoints("api_rank", "total_game_score_avg")

                if (oldCurrentChart == currentChart && points) {
                    chart = new Chart(ctx,
                        graphHandler.createScatterChart(
                            points,
                            "FRC Rank", //x axis title
                            "Avg Score" //y axis title
                        )
                    )
                } else if (!points) {
                    return false
                }
                
                break
            case 1:
                switchChart("bar")

                points = await getPoints("team_master_tm_number", "avg_gm_score", POINT_COLOR)

                consoleLog(points)

                if (oldCurrentChart == currentChart && points) {
                    chart = new Chart(ctx,
                        graphHandler.createBarGraph(
                            points,
                            "gameScore",
                            15
                        )
                    )
                } else if (!points) {
                    return false
                }
                
                break
            case 2:
                switchChart("spider")
                points = await getPoints("team_master_tm_number", "avg_gm_score", POINT_COLOR)
                consoleLog(points)

                if (oldCurrentChart == currentChart && points) {
                    const config = await graphHandler.createSpiderChart(
                        points,
                        "gameScore",
                        15
                    )
                    consoleLog("CONF:")
                    consoleLog(config)
                    chart = new Chart(ctx,
                        config
                    )
                } else if (!points) {
                    return false
                }
                
                break
            case 3:
                switchChart("bar")

                points = await getPoints("team_master_tm_number", "auton_total_score_avg", POINT_COLOR)

                if (oldCurrentChart == currentChart && points) {
                    chart = new Chart(ctx,
                        graphHandler.createStackedBarGraph(
                            points,
                            ["autonUnused", "autonAmp", "autonSpeaker"],
                            "autonScore",
                        )
                    )
                } else if (!points) {
                   arrowRight.click() 
                }
                
                break
            case 4:
                switchChart("bar")

                points = await getPoints("team_master_tm_number", "teleop_total_score_avg", POINT_COLOR)

                if (oldCurrentChart == currentChart && points) {
                    chart = new Chart(ctx,
                        graphHandler.createStackedBarGraph(
                            points,
                            ["teleopAmp", "teleopSpeaker"],
                            "teleopScore",
                        )
                    )
                } else if (!points) {
                    return false
                }

                break
            case 5:
                switchChart("bar")

                points = await getPoints("team_master_tm_number", "endgame_total_score_avg", POINT_COLOR)

                if (oldCurrentChart == currentChart && points) {
                    chart = new Chart(ctx,
                        graphHandler.createBarGraph(
                            points,
                            "endgameScore"
                        )
                    )
                } else if (!points) {
                    return false
                }
                
                break
            case 6:
                switchChart("bar")

                points = await getPoints("team_master_tm_number", "games_played", POINT_COLOR)

                if (oldCurrentChart == currentChart && points) {
                    chart = new Chart(ctx,
                        graphHandler.createBarGraph(
                            points,
                            "gamesPlayed"
                        )
                    )
                } else if (!points) {
                    return false
                }
                
                break
        }

        debounce = false
    }

    //variable stores currently selected chart
    //initialize to scatterchart
    updateMarker(null, currentChart)

    //when the arrows are clicked, draw a new graph
    arrowLeft.addEventListener("click", async () => {
        if (debounce) { return }

        if (chart) {
            chart.destroy()
        }

        const old = currentChart

        currentChart = currentChart == 0 ? 6 : currentChart - 1

        updateMarker(old, currentChart)

        const chartRes = await drawChart(currentChart) 

        if (chartRes === false) {
            debounce = false
            arrowLeft.click()
        }
    })

    //when the arrows are clicked, draw a new graph
    arrowRight.addEventListener("click", async () => {
        if (debounce) { return }

        consoleLog("click")
        if (chart) {
            chart.destroy()
        }
        //increment currentChart
        const old = currentChart

        currentChart = currentChart == 6 ? 0 : currentChart + 1

        updateMarker(old, currentChart)

        const chartRes = await drawChart(currentChart) 

        if (chartRes === false) {
            debounce = false
            arrowRight.click()
        }
    })

    let chartRes = await drawChart(currentChart)
    while (chartRes === false) {
        consoleLog("CHART RES")
        debounce = false
        arrowRight.click()
        chartRes = await drawChart(currentChart)
    }
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
        button.addEventListener("click", async () => {
            if (debounce) { return }
            if (button.name != currentChart) {
                if (chart) {
                    chart.destroy()
                }
                updateMarker(currentChart, button.name)
                consoleLog("NUMBER: ", Number(button.name))
                currentChart = Number(button.name)
                const res = await drawChart(currentChart)
                if (res === false) {
                    debounce = false
                    arrowRight.click()
                }
            }
        })
    }

    document.addEventListener("click", (event) => {
        const tooltip = document.getElementById("tooltip")
        if (tooltip) {
            const box = tooltip.getBoundingClientRect()
            if (!(event.clientX > box.left && event.clientX < box.right && event.clientY < box.bottom && event.clientY > box.top)) {
                tooltip.style.opacity = 0
                tooltip.getElementsByTagName("button")[0].style.display = "none"
                tooltip.style.width = 0
            }
        }
    })
}
