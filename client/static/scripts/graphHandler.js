import { selectRandom, getColor, consoleLog} from "./utility.js"

function writeData(points) {
    return {  
        teamNumber: points.map(p => p.teamNumber),
        teamName: points.map(p => p.teamName),
        rank: points.map(p => p.rank),
        gamesPlayed: points.map(p => p.gamesPlayed),
        gameScore: points.map(p => Math.round(p.gameScore) ),
        links: points.map((p) => {
            if(p.links) {
                return p.links.toFixed(1)
            }
            return "N/A"
        }),
        autoDocking: points.map(p => Math.round(p.autoDocking)),
        endgameDocking: points.map(p => Math.round(p.endgameDocking)),


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


export { createScatterChart, createBarGraph, writeData }