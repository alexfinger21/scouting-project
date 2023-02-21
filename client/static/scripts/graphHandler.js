import {selectRandom, getColor} from "./utility.js"

//Point style options
const letterOptions = [
    "l",
    "t"
]

//Point color options
const colorOptions = [
    "red",
    "green",
    "yellow"
]

//Generates a dictionary containing randomized values
function generatePoint() {
    const img = new Image()

    let letter = selectRandom(letterOptions)
    let color = selectRandom(colorOptions)

    img.src = "../static/images/letters/" + letter + "/" + color + ".png"
    img.height = 15
    img.width = 12

    let teamName = "Team " +  Math.round(Math.random() * 9999)

    return {teamName, x: Math.round(Math.random() * 50), y: Math.round(Math.random() * 50), shape: img, color: getColor(color) }
}

function writeData(points) {
    return {
        teamName: points.map(p => p.teamName),
        datasets: [{
            label: 'Legend',
            pointRadius: 4,
            pointStyle: points.map(p => p.shape),
            borderColor: points.map(p => p.color),
            pointBackgroundColor: points.map(p => p.color),
            data: points
        }]
    }
}

//Returns the data to be fed into a chart.js scatterchart given an array containing the points
function createGraph(points, chartType, xAxisTitle, yAxisTitle) {
    return {
        type: chartType,
        data: writeData(points),
        options: {
            tooltips: {
                bodyFontStyle: "bold",
                footerFontStyle: "normal",
                callbacks: {
                    label: function (tooltipItem, data) {
                        let teamName = data.teamName[tooltipItem.index]
                        let text = [teamName + ": (" + tooltipItem.xLabel + ', ' + tooltipItem.yLabel + ")"]
                        return text
                    },
                    //color does not appear before the footer
                    footer: function (tooltipItems, data) {
                        return [
                            "Plays Defense: ✅",
                            "Avg. Auto Score: 4",
                            "Avg. Tele-op Score: 2",
                            "Avg. Endgame Score: 15"
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

export {generatePoint, createGraph, writeData}