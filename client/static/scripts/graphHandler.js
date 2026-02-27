import { selectRandom, getColor, consoleLog, requestPage, paths, deepMerge } from "./utility.js"
import { darkenRGBString, getTeamColor } from "./teamColor.js"

const CHART_SIZE_CONST = 1.7

function createTooltip(context) {
	consoleLog("context", context)
	// Tooltip Element
	let tooltipEl = document.getElementById('tooltip')

	// Create element on first render
	if (!tooltipEl) {
		tooltipEl = document.createElement('div')
		tooltipEl.id = 'tooltip'
		tooltipEl.innerHTML = '<table></table>'

		document.body.appendChild(tooltipEl)
	}

	// Hide if no tooltip
	const tooltipModel = context.tooltip
	const config = context.chart.config._config
	if(tooltipModel.opacity === 0) {
		tooltipEl.style.opacity = 0
		tooltipEl.getElementsByTagName("button")[0].style.display = "none"
		return
	}


	let data
	if(config.type == "bar") {
		data = {}
		const idx = tooltipModel.dataPoints[0].dataIndex
		for(const [k, v] of Object.entries(config.data)) {
			data[k] = v[idx]
		}
	}
	else {
		data = tooltipModel.dataPoints[0].raw
	}

	consoleLog("newdata", data)

	// Set caret Position
	tooltipEl.classList.remove('above', 'below', 'no-transform')
	if (tooltipModel.yAlign) {
		tooltipEl.classList.add(tooltipModel.yAlign)
	} else {
		tooltipEl.classList.add('no-transform')
	}

	// Set Text
	if (tooltipModel.body) {
		const gs = Number(data.gameScore) > 0 ? Number(data.gameScore) : 1
		let titleLines = tooltipModel.title || []
		/*const coralScore = Number(data.coralScore) / gs
	const algaeScore = (Number(data.algaeScore)) / gs */

		let bodyLines = {
			"Game Score": data.gameScore,
			"Games Played": data.gamesPlayed,
			/*"Rank": data.rank,
	    "OPR": data.opr,
	    "Teleop Score": data.teleopScore,
	    "Auton Score": data.autonScore,
	    "Endgame Score": data.endgameScore,
	    "Can Dislodge": data.dislodgeTotal > 1,
	    "Coral % of Score": coralScore.toFixed(1),
	    "Algae % of Score": algaeScore.toFixed(1),
	    "Coral Accuracy": data.autonAccuracy * 100 + "% (a) " + data.teleopAccuracy * 100 + "% (t)" */
		}

		let innerHtml = '<thead>'

		//title
		if(data.teamNumber) {
			innerHtml += `<tr><th>${data.teamNumber} - ${data.teamName}</th></tr>`
		}

		innerHtml += '</thead><tbody>'

		for (const [k, v] of Object.entries(bodyLines)) {
			const span = `<span>${k}: ${v}</span>`
			innerHtml += '<tr><td>' + span + '</td></tr>'
		}

		//button
		innerHtml += `<tr><td><button id="tooltip-button" style="pointer-events: auto" >Details</button></tr></td>`


		innerHtml += '</tbody>'

		const tableRoot = tooltipEl.querySelector('table')
		tableRoot.innerHTML = innerHtml

	}

	let position = context.chart.canvas.getBoundingClientRect()
	let bodyFont = Chart.helpers.toFont(tooltipModel.options.bodyFont)

	const bottomBar = $("#footer")

	// Display, position, and set styles for font
	tooltipEl.style.width = "auto"
	tooltipEl.style.opacity = 1
	tooltipEl.getElementsByTagName("button")[0].style.display = "block"
	tooltipEl.style.zIndex = 10
	tooltipEl.style.position = 'absolute'
	consoleLog($("#tooltip").outerWidth(), $("#tooltip").outerHeight())
	tooltipEl.style.font = bodyFont.string
	tooltipEl.style.left = Math.min(window.innerWidth -  $("#tooltip").outerWidth(), position.left + window.scrollX + tooltipModel.caretX) + 'px'
	tooltipEl.style.top = Math.min(window.innerHeight - bottomBar.outerHeight() - $("#tooltip").outerHeight(), position.top + window.scrollY + tooltipModel.caretY) + 'px'
	tooltipEl.style.pointerEvents = 'none'

	consoleLog(window.innerHeight, bottomBar.outerHeight(), $("#tooltip").outerHeight())
	consoleLog(position.top, window.scrollY, tooltipModel.caretY)

	const btn = document.getElementById("tooltip-button")
	if(btn) {
		btn.onclick = () => {
			consoleLog("Clicked")
			requestPage(paths.teamDetails + "?team=" + data.teamNumber, {}, paths.teamDetails )
			const hoverButton = document.getElementById("hover-button")
			if(hoverButton) {
				hoverButton.style.opacity = 0
			}
			//hide tooltip
			tooltipEl.style.opacity = 0
			tooltipEl.getElementsByTagName("button")[0].style.display = "none"
		}
	}
}
function writeDataLists(points) {
	consoleLog("POINTS");
	consoleLog(points);

	return {
		// Identifiers & Meta
		teamNumber: points.map(p => p.teamNumber),
		teamName: points.map(p => p.teamName),
		seasonYear: points.map(p => p.seasonYear),
		eventCode: points.map(p => p.eventCode),
		gameType: points.map(p => p.gameType),
		gamesPlayed: points.map(p => p.gamesPlayed),
		hidden: points.map(p => p.hidden),
		
		//calculated Stats
		

		autonScore: points.map(p => (p.autonScore ?? 0).toFixed(1)),

		teleopScore: points.map(p => (p.teleopScore ?? 0).toFixed(1)),

		gameScore: points.map(p => (p.gameScore ?? 0).toFixed(1)),
		totalClimbScoreAvg: points.map(p => (p.totalClimbScoreAvg ?? 0).toFixed(1)),
		totalFuelScoreAvg: points.map(p => (p.totalFuelScoreAvg ?? 0).toFixed(1)),
		defensiveEffect: points.map(p => (p.defensiveEffect ?? 0).toFixed(1)),
		fieldTraversalIndex: points.map(p => (p.fieldTraversalIndex ?? 0).toFixed(1)),
		defenseResistance: points.map(p => (p.defenseResistance ?? 0).toFixed(1)),

		endgameClimbScoreAvg: points.map(p => (p.endgameClimbScoreAvg ?? 0).toFixed(1)),
		// Auton Stats
		autonFuelCountSum: points.map(p => (p.autonFuelCountSum ?? 0).toFixed(1)),
		autonFuelCountAvg: points.map(p => (p.autonFuelCountAvg ?? 0).toFixed(1)),
		autonFuelScoreSum: points.map(p => (p.autonFuelScoreSum ?? 0).toFixed(1)),
		autonFuelScoreAvg: points.map(p => (p.autonFuelScoreAvg ?? 0).toFixed(1)),
		autonClimbAttemptSum: points.map(p => (p.autonClimbAttemptSum ?? 0).toFixed(1)),
		autonClimbAttemptAvg: points.map(p => (p.autonClimbAttemptAvg ?? 0).toFixed(1)),
		autonClimbSuccessSum: points.map(p => (p.autonClimbSuccessSum ?? 0).toFixed(1)),
		autonClimbSuccessAvg: points.map(p => (p.autonClimbSuccessAvg ?? 0).toFixed(1)),

		// Teleop Stats
		teleopCyclingTimeSum: points.map(p => (p.teleopCyclingTimeSum ?? 0).toFixed(1)),
		teleopCyclingTimeAvg: points.map(p => (p.teleopCyclingTimeAvg ?? 0).toFixed(1)),
		teleopStockpilingTimeSum: points.map(p => (p.teleopStockpilingTimeSum ?? 0).toFixed(1)),
		teleopStockpilingTimeAvg: points.map(p => (p.teleopStockpilingTimeAvg ?? 0).toFixed(1)),
		teleopDefenseTimeSum: points.map(p => (p.teleopDefenseTimeSum ?? 0).toFixed(1)),
		teleopDefenseTimeAvg: points.map(p => (p.teleopDefenseTimeAvg ?? 0).toFixed(1)),
		teleopBrokenTimeSum: points.map(p => (p.teleopBrokenTimeSum ?? 0).toFixed(1)),
		teleopBrokenTimeAvg: points.map(p => (p.teleopBrokenTimeAvg ?? 0).toFixed(1)),
		teleopFuelCountSum: points.map(p => (p.teleopFuelCountSum ?? 0).toFixed(1)),
		teleopFuelCountAvg: points.map(p => (p.teleopFuelCountAvg ?? 0).toFixed(1)),
		teleopFuelScoreSum: points.map(p => (p.teleopFuelScoreSum ?? 0).toFixed(1)),
		teleopFuelScoreAvg: points.map(p => (p.teleopFuelScoreAvg ?? 0).toFixed(1)),

		// Endgame Stats
		endgameClimbAttemptSum: points.map(p => (p.endgameClimbAttemptSum ?? 0).toFixed(1)),
		endgameClimbAttemptAvg: points.map(p => (p.endgameClimbAttemptAvg ?? 0).toFixed(1)),
		endgameClimbL1SuccessSum: points.map(p => (p.endgameClimbL1SuccessSum ?? 0).toFixed(1)),
		endgameClimbL1SuccessAvg: points.map(p => (p.endgameClimbL1SuccessAvg ?? 0).toFixed(1)),
		endgameClimbL2SuccessSum: points.map(p => (p.endgameClimbL2SuccessSum ?? 0).toFixed(1)),
		endgameClimbL2SuccessAvg: points.map(p => (p.endgameClimbL2SuccessAvg ?? 0).toFixed(1)),
		endgameClimbL3SuccessSum: points.map(p => (p.endgameClimbL3SuccessSum ?? 0).toFixed(1)),
		endgameClimbL3SuccessAvg: points.map(p => (p.endgameClimbL3SuccessAvg ?? 0).toFixed(1)),

		// API/Ranking Stats
		rank: points.map(p => p.rank),
		win: points.map(p => p.win),
		loss: points.map(p => p.loss),
		tie: points.map(p => p.tie),
		dq: points.map(p => p.dq),
		opr: points.map(p => (p.opr ?? 0).toFixed(1)),
		dpr: points.map(p => (p.dpr ?? 0).toFixed(1)),
		oprRank: points.map(p => p.oprRank),
		dprRank: points.map(p => p.dprRank),

		// Graph Plotting
		x: points.map(p => p.x),
		y: points.map(p => (p.y ?? 0).toFixed(1)),
		color: points.map(p => p.color)
	};
}
function writeData(points) {
	consoleLog("From write data:")
	consoleLog("Points are")
	consoleLog(points)
	return {
		...writeDataLists(points),
		datasets: [{
			label: 'Legend',
			pointRadius: 5 * CHART_SIZE_CONST,
			//pointStyle: points.map(p => p.shape),
			borderColor: points.map(p => p.color),
			pointBackgroundColor: points.map(p => p.color),
			data: points
		}]
	}
}

async function getTeamData(team, records, existingColors) {
	return new Promise((resolve, reject) => {
		consoleLog("team is", team)
		getTeamColor(team.teamNumber.toString(), team.teamName, existingColors).then((color) => {
			consoleLog(team.teamNumber, "-", color)
			existingColors.push(color)
			consoleLog("TEAM DATA: ", team)
			return resolve({
				label: team.teamNumber,
				hidden: team.hidden,
				data: Object.entries(records).map(([key, val]) => {
					if( val == 0) {
						return 0 
					}
					return team[key] / val
				}),
				fill: true,
				backgroundColor: team.hidden == false ? team.color.substring(0, team.color.length - 1) + ", 0.2)" : `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.2)`,
				borderColor: team.hidden == false ? team.color : `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
				pointBorderColor: '#fff',
				pointHoverBackgroundColor: '#fff',
				pointHoverBorderColor: team.hidden == false ? team.color : `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
			})
		})
	})
}

async function writeSpiderData(points) {
	/*consoleLog("hello from spider chart. points:")
    consoleLog(points)*/

	let data = []
	let existingColors = []
	const records = {
		teleopStockpilingTimeAvg: Math.max(...points.map(p => p.teleopStockpilingTimeAvg)),
		defensiveEffect: Math.max(...points.map(p => p.defensiveEffect)),
		totalClimbScoreAvg: Math.max(...points.map(p => p.totalClimbScoreAvg)),
		totalFuelScoreAvg: Math.max(...points.map(p => p.totalFuelScoreAvg)),
		//rank: Math.max(...points.map(p => Math.round(p.rank))),
		reliabilityIndex: Math.max(...points.map(p => p.reliabilityIndex)),
		defenseResistance: Math.max(...points.map(p => p.defenseResistance)),
	}


	for (let i = 0; i < points.length; i++) {
		const team = points[i]
		data.push(getTeamData(team, records, existingColors))
	}

	const res = {
		labels: [
			"Stockpiling", "Defense", "Climb", "Fuel", "Reliability", "Defense Resistance"
		],
		datasets: (await Promise.all(data)).sort((a, b) => a.label - b.label)
	}
	consoleLog("RES: ", res)
	return res
}

//Returns the data to be fed into a chart.js scatterchart given an array containing the points
function createScatterChart(points, xAxisTitle, yAxisTitle) {

	return {
		type: "scatter",
		data: writeData(points),
		options: {
			events: ["click"],
			maintainAspectRatio: false,
			scales: {
				x: {
					ticks: {
						font: {
							size: 10 * CHART_SIZE_CONST,
						}
					},

					title: {
						display: true,
						text: xAxisTitle,
						font: {
							size: 10 * CHART_SIZE_CONST
						}
					},
					position: 'bottom',
					beginAtZero: true,
				},
				y: {
					ticks: {
						font: {
							size: 10 * CHART_SIZE_CONST,
						}
					},
					title: {
						display: true,
						text: yAxisTitle,
						font: {
							size: 10 * CHART_SIZE_CONST
						}
					},
					position: 'left',
					beginAtZero: true,
				},

			},
			layout: {
				padding: {
					top: 20,
					right: 20,
					bottom: 0
				}
			},
			plugins: {
				legend: {
					display: false,
					labels: {
						usePointStyle: true,
						font: {
							size: 10 * CHART_SIZE_CONST
						}
					}
				},
				tooltip: {
					enabled: false,
					external: createTooltip
					/*callbacks: {
			label: function(tooltipItem, data) { //tooltipitem is the tooltip item object (not an array)
			    consoleLog("Hi!!")
			    let teamNumber = data.teamNumber[tooltipItem.index]
			    let text = ["Team " + teamNumber]
			    return text
			},
						//color does not appear before the footer
			footer: function(tooltipItems, data) { //tooltipitems is an array, where the zeroth index is the selected tooltip
			    let index = tooltipItems[0].index
			    let teamName = data.teamName[index]
			    let rank = data.rank[index]
			    let gamesPlayed = data.gamesPlayed[index]
			    let gameScore = data.gameScore[index]
			    let links = data.links[index]
			    let autoDocking = data.autoDocking[index]
			    let endgameDocking = data.endgameDocking[index]

			    return [
				"Name: " + teamName,
				"Rank: " + rank,
				"Games Played: " + gamesPlayed,
				"Avg Game Score: " + gameScore,
				"Avg Links: " + links,
				"Avg Auto Chg Dock: " + autoDocking,
				"Avg Endgame Chg Dock: " + endgameDocking
			    ]
			}
		    }*/
					},
			}
		},
	}
}

function createBarGraph(points, orderBy) {
	points = points.sort( (a, b) => b[orderBy] - a[orderBy])
	consoleLog("PTS:", points)

	consoleLog("TYPE A", {teamNumber: points.map(p => p.teamNumber),
		teamName: points.map(p => p.teamName),
		rank: points.map(p => p.rank),
		gamesPlayed: points.map(p => p.gamesPlayed),
		gameScore: points.map(p => Math.round(p.gameScore)),
		opr: points.map(p => Math.round(p.opr)),
		teleopScore: points.map(p => Math.round(p.teleopScore)),
		autonScore: points.map(p => Math.round(p.autonScore)),
		labels: points.map(p => p.teamNumber),})
	consoleLog("TYPE B", writeDataLists(points))

	//consoleLog("CHART_SIZE: ", 10 * screen.height/CHART_SIZE_CONST)

	return {
		type: 'bar',
		data: {
			...writeDataLists(points),
			labels: points.map(p => p.teamNumber),
			datasets: [{
				label: 'Legend',
				data: points.map(p => {
					if (orderBy == "gameScore" || orderBy == "autoDocking" || orderBy == "endgameDocking") {
						return Math.round(p[orderBy])
					} else if (orderBy == "links") {
						if (p.links) {
							return p.links.toFixed(1)
						}
						return "N/A"
					} else {
						return p[orderBy]
					}
				}),
				backgroundColor: points.map(p => p.color),
				borderColor: points.map(p => p.color),
				borderWidth: 1,
				pointRadius: 26 * CHART_SIZE_CONST 
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			events: ["click"],
			indexAxis: "y",
			scales: {
				x: {
					max: points[0][orderBy] * 1.1,
					position: "top",
					ticks: {
						font: {
							size: 9 * CHART_SIZE_CONST
						}
					},
					title: {
						font: {
							size: 10 * CHART_SIZE_CONST
						}
					}
				},
				y: {
					ticks: {
						font: {
							size: 9 * CHART_SIZE_CONST
						}
					}, 
					title: {
						font: {
							size: 10 * CHART_SIZE_CONST
						}
					}
				}
			},
			//display values next to bars
			//events: false,
			hover: {
				animationDuration: 0
			},
			/*animation: {
		duration: 1,
		onComplete: function () {
		    let chartInstance = this.chart,
			ctx = chartInstance.ctx;
		    ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
		    ctx.textAlign = 'center';
		    ctx.textBaseline = 'bottom';

		    this.data.datasets.forEach(function (dataset, i) {
			let meta = chartInstance.controller.getDatasetMeta(i);
			meta.data.forEach(function (bar, index) {
			    let data = dataset.data[index];
			    if (data != null && data != 0) {
				ctx.fillText(data, bar._model.x + data.toString().length * 5, bar._model.y + 6);
			    }
			});
		    });
		}
	    },*/
			plugins: {
				legend: {
					display: false,
					labels: {
						usePointStyle: true
					}
				},
				zoom: {
					pan: {
						enabled: true
					},
					zoom: {
						enabled: true
					}
				},
				tooltip: {
					enabled: false,
					external: createTooltip
					/*  
		    callbacks: {
			label: function(tooltipItem, data) { //tooltipitem is the tooltip item object (not an array)
			    let teamNumber = data.teamNumber[tooltipItem.index]
			    let text = ["Team " + teamNumber]
			    return text
			},
			    //color does not appear before the footer
			footer: function(tooltipItems, data) { //tooltipitems is an array, where the zeroth index is the selected tooltip
			    let index = tooltipItems[0].index
			    let teamName = data.teamName[index]
			    let rank = data.rank[index]
			    let gamesPlayed = data.gamesPlayed[index]
			    let gameScore = data.gameScore[index]
			    let links = data.links[index]
			    let autoDocking = data.autoDocking[index]
			    let endgameDocking = data.endgameDocking[index]

			    return [
				"Name: " + teamName,
				"Rank: " + rank,
				"Games Played: " + gamesPlayed,
				"Avg Game Score: " + gameScore,
				"Avg Links: " + links,
				"Avg Auto Chg Dock: " + autoDocking,
				"Avg Endgame Chg Dock: " + endgameDocking
			    ]
			}
		    }*/
		    },
			}
		},

	}
}

function createStackedBarGraph(points, orderBy, scoring, backgroundColor) {
	points = points.sort( (a, b) => b[scoring] - a[scoring])
	let max = Math.max(...points.map((p) => {
		let sum = 0
		for(const category of orderBy) {
			sum += p[category]
		}
		return sum
	}))

	const dataLists = writeDataLists(points)
	return {
		type: 'bar',
		data: {
			...dataLists,
			labels: points.map(p => p.teamNumber),
			datasets: orderBy.map((category, index) => ({
				label: category,
				data: points.map(p => p[category] ? p[category].toFixed(2) : 0),
				backgroundColor: backgroundColor ? backgroundColor[index] : ["rgb(75,192,192)", "rgb(255,99,132)", "rgb(54,162,235)" ][index],
				borderColor: points.map(p => p.color),
				borderWidth: 5
			})),
		},
		options: {
			maintainAspectRatio: false,
			responsive: true,
			indexAxis: "y",
			events: ["click"],
			scales: {
				x: {
					position: "top",
					stacked: true,
					max: Math.round(1.1*max),
					scaleLabel: {
						display: false,
						//labelString: xAxisTitle,
					},
					ticks: {
						font: {
							size: 9 * CHART_SIZE_CONST
						}
					},
					title: {
						font: {
							size: 10 * CHART_SIZE_CONST
						}
					}
				},

				y: {
					stacked: true,
					scaleLabel: {
						display: false,
						//labelString: yAxisTitle,
					},
					ticks: {
						font: {
							size: 12 * CHART_SIZE_CONST
						}
					},
					title: {
						font: {
							size: 11 * CHART_SIZE_CONST
						}
					}
				},
			},
			//display values next to bars
			//events: false,
			hover: {
				animationDuration: 0
			},
			plugins: {
				legend: {
					display: true,
					labels: {
						font: {
							size: 10 * CHART_SIZE_CONST
						}
					}
				},
				zoom: {
					pan: {
						enabled: true
					},
					zoom: {
						enabled: true
					}
				},
				tooltip: {
					enabled: false,
					external: createTooltip
				},
				datalabels: {
					color: "#36A2EB",
					anchor: "end",
					align: "end",
					labels: {
						title: {
							font: {
								size: 13 * CHART_SIZE_CONST
							}
						}
					},
					formatter: function(value, context) {
						if(context.datasetIndex == orderBy.length - 1) {
							//consoleLog(scoring, "in", context.chart.data)

							console.log("DATA", context.chart.data)
							return context.chart.data[scoring][context.dataIndex];
						}
						return ''
					},
					padding: {
						left: 10,
					}
				}
			},
		},
		plugins: [ChartDataLabels]

	}
}

async function createSpiderChart(points, showLegend=true) {
	return {
		type: "radar",
		data: await writeSpiderData(points),
		options: {
			maintainAspectRatio: false,
			responsive: true,
			elements: {
				line: {
					borderWidth: 3,
				}
			},
			tooltips: {
				enabled: false,
				external: createTooltip,
				/*callbacks: {
		    label: function(tooltipItem, data) { //tooltipitem is the tooltip item object (not an array)
			let teamNumber = data.teamNumber[tooltipItem.index]
			let text = ["Team " + teamNumber]
			return text
		    },
					//color does not appear before the footer
		    footer: function(tooltipItems, data) { //tooltipitems is an array, where the zeroth index is the selected tooltip
			let index = tooltipItems[0].index
			let teamName = data.teamName[index]
			let rank = data.rank[index]
			let gamesPlayed = data.gamesPlayed[index]
			let gameScore = data.gameScore[index]
			let links = data.links[index]
			let autoDocking = data.autoDocking[index]
			let endgameDocking = data.endgameDocking[index]

			return [
			    "Name: " + teamName,
			    "Rank: " + rank,
			    "Games Played: " + gamesPlayed,
			    "Avg Game Score: " + gameScore,
			    "Avg Links: " + links,
			    "Avg Auto Chg Dock: " + autoDocking,
			    "Avg Endgame Chg Dock: " + endgameDocking
			]
		    }
		}*/
				},

			scales: {
				r: {
					angleLines: {
						display: false
					},
					ticks: {
						display: false,
						fontSize: 10 * CHART_SIZE_CONST,
					},
					pointLabels: {
						font: {
							size: 10 * CHART_SIZE_CONST,
						}
					},
					beginAtZero: true,
				},
			},
			layout: {
				padding: {
					top: 20,
					right: 20,
					bottom: 0
				}
			},
			plugins: {
				legend: {
					display: showLegend,
					position: "top",
					labels: {
						boxWidth: 8,
						boxHeight: 8,
						font: {
							size: 10 * CHART_SIZE_CONST
						},
					},
				}
			}
		}
	}
}


export { createScatterChart, createStackedBarGraph, createBarGraph, createSpiderChart, writeData }
