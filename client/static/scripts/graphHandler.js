import { selectRandom, getColor, consoleLog } from "./utility.js"
import { getTeamColor } from "./teamColor.js"

const data1 = {
    labels: [
        'Eating',
        'Drinking',
        'Sleeping',
        'Designing',
        'Coding',
        'Cycling',
        'Running'
    ],
    datasets: [{
        label: 'My First Dataset',
        data: [65, 59, 90, 81, 56, 55, 40],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)'
    }, {
        label: 'My Second Dataset',
        data: [28, 48, 40, 19, 96, 27, 100],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)'
    }]
}

function writeData(points) {
    consoleLog("From write data:")
    consoleLog("Points are")
    consoleLog(points)
    return {
        teamNumber: points.map(p => p.teamNumber),
        teamName: points.map(p => p.teamName),
        rank: points.map(p => p.rank),
        gamesPlayed: points.map(p => p.gamesPlayed),
        gameScore: points.map(p => Math.round(p.ganeScore)),
        autonSpeaker: points.map(p => Math.round(p.autonSpeaker)),
        autonAmp: points.map(p => Math.round(p.autonAmp)),
        autonPickup: points.map(p => Math.round(p.autonPickup)),
        autonScored: points.map(p => Math.round(p.autonSpeaker + p.autonAmp)),
        teleopScore: points.map(p => Math.round(p.teleopScore)),
        rank: points.map(p => Math.round(p.rank)),
        opr: points.map(p => Math.round(p.opr)),

        datasets: [{
            label: 'Legend',
            pointRadius: 4,
            //pointStyle: points.map(p => p.shape),
            borderColor: points.map(p => p.color),
            pointBackgroundColor: points.map(p => p.color),
            data: points
        }]
    }
}

async function getTeamData(team, records, existingColors) {
    return new Promise((resolve, reject) => {
        getTeamColor(team.teamNumber.toString(), existingColors).then((color) => {
            existingColors.push(color)
            return resolve({
                label: team.teamNumber,
                data: [
                    1 - team.rank / records.rank,
                    team.opr / records.opr,
                    team.gamesPlayed / records.gamesPlayed,
                    team.gameScore / records.gameScore,
                    team.teleopScore / records.teleopScore,
                    team.autonNotes / records.autonNotes
                ],
                fill: true,
                backgroundColor: `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.2)`,
                borderColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
            })
        })
    })
}

async function writeSpiderData(points) {
    consoleLog("hello from spider chart. points:")
    consoleLog(points)

    let data = []
    let existingColors = []
    const records = {
        gamesPlayed: Math.max(...points.map(p => p.gamesPlayed)),
        gameScore: Math.max(...points.map(p => Math.round(p.gameScore))),
        autonNotes: Math.max(...points.map(p => Math.round(p.autonSpeaker + p.autonAmp))),
        teleopScore: Math.max(...points.map(p => Math.round(p.teleopScore))),
        rank: Math.max(...points.map(p => Math.round(p.rank))),
        opr: Math.max(...points.map(p => Math.round(p.opr))),
    }

    consoleLog("RECORDS ARE")
    consoleLog(records)



    for (let i = 0; i < points.length; i++) {
        const team = points[i]

        data.push(getTeamData(team, records, existingColors))
    }

    const res = {
        teamNumber: points.map(p => p.teamNumber),
        teamName: points.map(p => p.teamName),
        gamesPlayed: points.map(p => p.gamesPlayed),
        gameScore: points.map(p => Math.round(p.gameScore)),
        autonSpeaker: points.map(p => Math.round(p.autonSpeaker)),
        autonAmp: points.map(p => Math.round(p.autonAmp)),
        autonPickup: points.map(p => Math.round(p.autonPickup)),
        autonNotes: points.map(p => Math.round(p.autonSpeaker + p.autonAmp)),
        teleopScore: points.map(p => Math.round(p.teleopScore)),
        rank: points.map(p => Math.round(p.rank)),
        opr: points.map(p => Math.round(p.opr)),
        labels: [
            "Rank", "OPR", "Games Played", "Game Score", "Teleop Score", "Auton Notes"
        ],
        datasets: await Promise.all(data)
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
            maintainAspectRatio: false,
            tooltips: {
                bodyFontStyle: "bold",
                footerFontStyle: "normal",
                callbacks: {
                    label: function (tooltipItem, data) { //tooltipitem is the tooltip item object (not an array)
                        let teamNumber = data.teamNumber[tooltipItem.index]
                        let text = ["Team " + teamNumber]
                        return text
                    },
                    //color does not appear before the footer
                    footer: function (tooltipItems, data) { //tooltipitems is an array, where the zeroth index is the selected tooltip
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
                }
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: xAxisTitle,
                    },
                }],

                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: yAxisTitle,
                    }
                }],
            },
            legend: {
                display: false
            },
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 0
                }
            }
        }
    }
}

function createBarGraph(points, orderBy, stepValue) {
    consoleLog("STEP VALUE: " + stepValue)
    return {
        type: 'horizontalBar',
        data: {
            teamNumber: points.map(p => p.teamNumber),
            teamName: points.map(p => p.teamName),
            rank: points.map(p => p.rank),
            gamesPlayed: points.map(p => p.gamesPlayed),
            gameScore: points.map(p => Math.round(p.gameScore)),
            links: points.map((p) => {
                if (p.links) {
                    return p.links.toFixed(1)
                }
                return "N/A"
            }),
            autoDocking: points.map(p => Math.round(p.autoDocking)),
            endgameDocking: points.map(p => Math.round(p.endgameDocking)),
            labels: points.map(p => p.teamNumber),
            datasets: [{
                label: 'Legend',
                data: points.map(p => {
                    if (orderBy == "gameScore" || orderBy == "autoDocking" || orderBy == "endgameDocking") {
                        return Math.round(p[orderBy])
                    }
                    else if (orderBy == "links") {
                        if (p.links) {
                            return p.links.toFixed(1)
                        }
                        return "N/A"
                    }
                    else {
                        return p[orderBy]
                    }
                }),
                backgroundColor: points.map(p => p.color),
                borderColor: points.map(p => p.color),
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                display: false
            },
            //maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    position: "top",
                    ticks: {
                        beginAtZero: true,
                        steps: 10,
                        stepValue: stepValue,
                        max: stepValue * 10 //max value for the chart is 60
                    },

                    scaleLabel: {
                        display: false,
                        //labelString: xAxisTitle,
                    },
                }],

                yAxes: [{
                    scaleLabel: {
                        display: false,
                        //labelString: yAxisTitle,
                    }
                }],
            },
            tooltips: {
                bodyFontStyle: "bold",
                footerFontStyle: "normal",
                callbacks: {
                    label: function (tooltipItem, data) { //tooltipitem is the tooltip item object (not an array)
                        let teamNumber = data.teamNumber[tooltipItem.index]
                        let text = ["Team " + teamNumber]
                        return text
                    },
                    //color does not appear before the footer
                    footer: function (tooltipItems, data) { //tooltipitems is an array, where the zeroth index is the selected tooltip
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
                }
            },
            //display values next to bars
            //events: false,
            hover: {
                animationDuration: 0
            },
            animation: {
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
            }
        },
        plugins: {
            zoom: {
                pan: {
                    enabled: true
                },
                zoom: {
                    enabled: true
                }
            }
        }
    }
}

async function createSpiderChart(points) {
    return {
        type: "radar",
        data: await writeSpiderData(points),
        options: {
            maintainAspectRatio: false,
            elements: {
                line: {
                    borderWidth: 3,
                }
            },
            tooltips: {
                bodyFontStyle: "bold",
                footerFontStyle: "normal",
                callbacks: {
                    label: function (tooltipItem, data) { //tooltipitem is the tooltip item object (not an array)
                        let teamNumber = data.teamNumber[tooltipItem.index]
                        let text = ["Team " + teamNumber]
                        return text
                    },
                    //color does not appear before the footer
                    footer: function (tooltipItems, data) { //tooltipitems is an array, where the zeroth index is the selected tooltip
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
                }
            },
            legend: {
                display: false
            },
            scales: {
                r: {
                    angleLines: {
                        display: false
                    },
                    ticks: {
                        display: false,
                        fontSize: 80,
                    },
                    pointLabels: {
                        font: {
                            size: 30,
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12,
                        }
                    },
                }
            },
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 0
                }
            }
        }
    }
}


export { createScatterChart, createBarGraph, createSpiderChart, writeData }