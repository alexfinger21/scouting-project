import { selectRandom, getColor, consoleLog} from "./utility.js"

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
  };

function getRGB(color) {
    color = parseInt(color.substring(1), 16);
    r = color >> 16;
    g = (color - (r<<16)) >> 8;
    b = color - (r<<16) - (g<<8);
    return [r, g, b];
}
function isSimilar([r1, g1, b1], [r2, g2, b2]) {
    return Math.abs(r1-r2)+Math.abs(g1-g2)+Math.abs(b1-b2) < 50;
}

function teamToHsl() {
    let hash = 0;
    if (this.length === 0) return hash;
    for (let i = 0; i < this.length; i++) {
        hash = this.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
	return hash % 360;
}

async function getTeamColor(existingColors) {
    return fetch("https://api.frc-colors.com/v1/team/695")
        .then(response => response.json())
        .then((data) => {
            return data.primaryKey
        })
        .catch((error) => { //team not found
            
        })
    
    return "rgba(255, 99, 132, 0.2)"
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
        gameScore: points.map(p => Math.round(p.total_game_score_avg) ),
        autonSpeaker: points.map(p => Math.round(p.auton_notes_speaker_avg)),
        autonAmp: points.map(p => Math.round(p.auton_notes_amp_avg)),
        teleopScore: points.map(p => Math.round(p.endgameDocking)),

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

function writeSpiderData(points) {
    consoleLog("hello from spider chart. points:")
    consoleLog(points)

    let datasets = []

    for(let i = 0; i < points.length; i++) {
        const team = points[i]
        
        let set = {
            label: team.tm_master_team_number,
            data: Object.values(team),
            fill: true,
            backgroundColor: 
        }
    }

    return {
        labels: Object.keys(points[0]),
        datasets: [{
            label: "My First Dataset",
            data: []
        }]
    }
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
            gameScore: points.map(p => Math.round( p.gameScore )),
            links: points.map((p) => { 
                if(p.links) {
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
                    if(orderBy == "gameScore" || orderBy == "autoDocking" || orderBy == "endgameDocking") {
                        return Math.round(p[orderBy])
                    }
                    else if(orderBy == "links") {
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

function createSpiderChart(points) {
    return {
        type: "radar",
        data: writeSpiderData(points),  
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