import * as graphHandler from "./graphHandler.js"
import { paths, requestData, highlightColors, currentPage, consoleLog } from "./utility.js"

const POINT_COLOR = "rgb(147, 157, 168)"
const HIGHTLIGHT_COLOR = "rgb(158, 225, 87)"
const RED_COLOR = "rgb(225,87,89)"
const BLUE_COLOR = "rgb(52,146,234)"
let data = { 0: "dummy data" }

let debounce = false

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(async function (mutation) {data
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

let matchTeams = (await requestData("/api/getMatchTeams")).map((e) => {
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

export function getTeamProperties(team) {
	const endgameClimbScoreAvg = team.endgame_climb_l1_success_avg * 10 + team.endgame_climb_l2_success_avg * 20 + team.endgame_climb_l3_success_avg * 30
	return {
		// Identifiers & Meta
		teamNumber: team.team_master_tm_number,
		teamName: team.tm_name,
		seasonYear: team.frc_season_master_sm_year,
		eventCode: team.competition_master_cm_event_code,
		gameType: team.game_matchup_gm_game_type,
		gamesPlayed: team.nbr_games,

		// Calculated Stats
		gameScore: team.auton_fuel_score_avg + team.auton_climb_successful_avg * 15 + team.teleop_fuel_score_avg + endgameClimbScoreAvg,
		autonScore: team.auton_fuel_score_avg + team.auton_climb_successful_avg * 15,
		teleopScore: team.teleop_fuel_count_avg,
		endgameClimbScoreAvg: endgameClimbScoreAvg,	
		defensiveEffect: team.api_dpr * (team.teleop_defense_time_avg + team.teleop_stockpiling_time_avg),
		totalClimbScoreAvg: team.auton_climb_successful_avg * 15 + endgameClimbScoreAvg,
		totalFuelScoreAvg: team.auton_fuel_score_avg + team.teleop_fuel_score_avg,
		reliabilityIndex: 150 - team.teleop_broken_time_avg,
		fieldTraversalIndex: 0,
		defenseResistance: team.robot_drive_under_trench_avg + team.robot_drive_over_bump_avg + team.robot_shoot_while_moving_avg + team.robot_shoot_from_anywhere_avg + team.auton_climb_successful_avg + 5* (endgameClimbScoreAvg + team.auton_fuel_score_avg)/team.total_score_avg,

		defensiveShiftStockpilingTimeAvg: team.defensive_first_shift_stockpiling_avg + team.defensive_second_shift_stockpiling_avg,
		defensiveShiftCyclingTimeAvg: team.defensive_first_shift_cycling_avg + team.defensive_second_shift_cycling_avg,
		defensiveShiftDefenseTimeAvg: team.defensive_first_shift_defense_avg + team.defensive_second_shift_defense_avg,
		defensiveShiftBrokenTimeAvg: team.defensive_first_shift_broken_avg + team.defensive_second_shift_broken_avg,	

		offensiveShiftStockpilingTimeAvg: team.offensive_first_shift_stockpiling_avg + team.offensive_second_shift_stockpiling_avg,
		offensiveShiftCyclingTimeAvg: team.offensive_first_shift_cycling_avg + team.offensive_second_shift_cycling_avg,
		offensiveShiftDefenseTimeAvg: team.offensive_first_shift_defense_avg + team.offensive_second_shift_defense_avg,
		offensiveShiftBrokenTimeAvg: team.offensive_first_shift_broken_avg + team.offensive_second_shift_broken_avg,
		// Auton Stats
		autonFuelCountSum: team.auton_fuel_count_sum,
		autonFuelCountAvg: team.auton_fuel_count_avg,
		autonFuelScoreSum: team.auton_fuel_score_sum,
		autonFuelScoreAvg: team.auton_fuel_score_avg,
		autonClimbAttemptSum: team.auton_climb_attempt_sum,
		autonClimbAttemptAvg: team.auton_climb_attempt_avg,
		autonClimbSuccessSum: team.auton_climb_successful_sum,
		autonClimbSuccessAvg: team.auton_climb_successful_avg,

		// Teleop Stats
		teleopCyclingTimeSum: team.teleop_cycling_time_sum,
		teleopCyclingTimeAvg: team.teleop_cycling_time_avg,
		teleopStockpilingTimeSum: team.teleop_stockpiling_time_sum,
		teleopStockpilingTimeAvg: team.teleop_stockpiling_time_avg,
		teleopDefenseTimeSum: team.teleop_defense_time_sum,
		teleopDefenseTimeAvg: team.teleop_defense_time_avg,
		teleopBrokenTimeSum: team.teleop_broken_time_sum,
		teleopBrokenTimeAvg: team.teleop_broken_time_avg,
		teleopFuelCountSum: team.teleop_fuel_count_sum,
		teleopFuelCountAvg: team.teleop_fuel_count_avg,
		teleopFuelScoreSum: team.teleop_fuel_score_sum,
		teleopFuelScoreAvg: team.teleop_fuel_score_avg,

		// Endgame Stats
		endgameClimbAttemptSum: team.endgame_climb_attempt_sum,
		endgameClimbAttemptAvg: team.endgame_climb_attempt_avg,
		endgameClimbL1SuccessSum: team.endgame_climb_l1_success_sum,
		endgameClimbL1SuccessAvg: team.endgame_climb_l1_success_avg,
		endgameClimbL2SuccessSum: team.endgame_climb_l2_success_sum,
		endgameClimbL2SuccessAvg: team.endgame_climb_l2_success_avg,
		endgameClimbL3SuccessSum: team.endgame_climb_l3_success_sum,
		endgameClimbL3SuccessAvg: team.endgame_climb_l3_success_avg,

		// API/Ranking Stats
		rank: team.api_rank ?? 0,
		win: team.api_win ?? 0,
		loss: team.api_loss ?? 0,
		tie: team.api_tie ?? 0,
		dq: team.api_dq ?? 0,
		opr: team.api_opr ?? 0,
		dpr: team.api_dpr ?? 0,
		oprRank: team.api_opr_rank ?? 0,
		dprRank: team.api_dpr_rank ?? 0,
	}

}

function getPoints(x, y, color) {
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

            if (val[x] == undefined) {
                ++noVal
            }
		const point = getTeamProperties(val)
		// Graph Plotting
		point.x = val[x]
		point.y = val[y] ? val[y] : 0
		point.color = color
		point.hidden = hidden
		points.push(point)

	ind++
        }
    }

    if (noVal == points.length) {console.log('womp wimp') 
        return false}

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
                barGraphCanvas.setAttribute("style", "display: none !important")
                spiderCanvas.setAttribute("hidden", "hidden")
                spiderCanvas.setAttribute("style", "display: none !important")
                scatterPlotCanvas.parentElement.style.height = "100%"
                ctx = scatterPlotCanvas.getContext("2d")
                break
            case "bar":
                scatterPlotCanvas.setAttribute("hidden", "hidden")
                scatterPlotCanvas.setAttribute("style", "display: none !important")
                barGraphCanvas.removeAttribute("hidden")
                barGraphCanvas.removeAttribute("style")
                spiderCanvas.setAttribute("hidden", "hidden")
                spiderCanvas.setAttribute("style", "display: none !important")
                ctx = barGraphCanvas.getContext("2d")
                const height = `${Math.round(points.length * 35)}px` //adjust height based on data
                barGraphCanvas.parentElement.style.height = height
                barGraphCanvas.style.height=height
                break
            case "spider":
                scatterPlotCanvas.setAttribute("hidden", "hidden")
                scatterPlotCanvas.setAttribute("style", "display: none !important")
                barGraphCanvas.setAttribute("hidden", "hidden")
                barGraphCanvas.setAttribute("style", "display: none !important")
                spiderCanvas.removeAttribute("hidden")
                spiderCanvas.removeAttribute("style")
                spiderCanvas.parentElement.style.height = "100%"
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
                consoleLog("TRY TO SWITCH")
                switchChart("scatter")
                ctx = scatterPlotCanvas.getContext("2d")
                points = await getPoints("api_rank", "total_score_avg")

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

                points = await getPoints("team_master_tm_number", "total_score_avg`", POINT_COLOR)


                if (oldCurrentChart == currentChart && points) {
                    chart = new Chart(ctx,
                        graphHandler.createStackedBarGraph(
                            points,
                            ["autonScore", "teleopScore", "endgameClimbScoreAvg",],
                            "gameScore",
                        )
                    )
                } else if (!points) {
                    return false
                }
                
                break
            case 2:
                switchChart("spider")
                points = await getPoints("team_master_tm_number", "total_game_score_avg", POINT_COLOR)

                if (oldCurrentChart == currentChart && points) {
                    const config = await graphHandler.createSpiderChart(
                        points,
                    )
			console.log("SPIDER CHART CONFIG", config)
                    chart = new Chart(ctx,
                        config
                    )
                } else if (!points) {
                    return false
                }
                
                break
            case 3: //defensive shift breakdown
                switchChart("bar")

                points = await getPoints("team_master_tm_number", "total_game_score_avg", POINT_COLOR)

                if (oldCurrentChart == currentChart && points) {
                    chart = new Chart(ctx,
                        graphHandler.createStackedBarGraph(
                            points,
                            ["defensiveShiftCyclingTimeAvg", "defensiveShiftStockpilingTimeAvg", "defensiveShiftDefenseTimeAvg","defensiveShiftBrokenTimeAvg"],
                            "gameScore",
                            ["rgb(47, 237, 174)", "rgb(239, 220, 112)", "rgb(128, 193, 255)", "rgb(255, 113, 91)"]   
                        )
                    )
                } else if (!points) {
                    return false
                }               
                break
            case 4: //offensive shift breakdown
                switchChart("bar")

                points = await getPoints("team_master_tm_number", "total_game_score_avg", POINT_COLOR)

                if (oldCurrentChart == currentChart && points) {
                    chart = new Chart(ctx,
                        graphHandler.createStackedBarGraph(
                            points,
                            ["offensiveShiftCyclingTimeAvg", "defensiveShiftStockpilingTimeAvg", "defensiveShiftDefenseTimeAvg","defensiveShiftBrokenTimeAvg"],
                            "gameScore",
                            ["rgb(47, 237, 174)", "rgb(239, 220, 112)", "rgb(128, 193, 255)", "rgb(255, 113, 91)"]   
                        )
                    )
                } else if (!points) {
                    return false
                }

                break
            case 5: //total time breakdown
                switchChart("bar")

                points = await getPoints("team_master_tm_number", "total_score_avg", POINT_COLOR)

                if (oldCurrentChart == currentChart && points) {
                    chart = new Chart(ctx,
                        graphHandler.createStackedBarGraph(
                            points,
                            ["teleopCyclingTimeAvg", "teleopStockpilingTimeAvg", "teleopDefenseTimeAvg", "teleopBrokenTimeAvg"],
				"gameScore"
                        )
                    )
                } else if (!points) {
                    return false
                }
                
                break
            case 6: // Total game points on average by section
                switchChart("bar")

                points = await getPoints("team_master_tm_number", "total_game_score_avg", POINT_COLOR)

                if (oldCurrentChart == currentChart && points) {
                    chart = new Chart(ctx,
                        graphHandler.createStackedBarGraph(
                            points,
                            ["autonFuelScoreAvg", "teleopFuelScoreAvg", "endgameClimbScoreAvg"],
                            "gameScore",
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
