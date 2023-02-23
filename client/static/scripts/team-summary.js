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
    for (const val of data) {
        console.log(val.team_master_tm_number)
        points.push({
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
        })
    }
    return points
}


function main() {
    let chart
    let currentChart = 0 //goes from 0 to 5
    const ctx = document.getElementById("team-summary-chart").getContext("2d")
    let points

    async function drawChart(number) {
        //create chart based off of number
        switch(number) {
            case 0:
                points = await getPoints("api_rank", "avg_gm_score", "rgb(81, 121, 167)")
                chart = new Chart(ctx, 
                    graphHandler.createScatterChart(
                        points,
                        "FRC Rank", //x axis title
                        "Avg Score" //y axis title
                    )
                )
                break;
            case 1:
                points = await getPoints("api_rank", "avg_gm_score", "rgb(81, 121, 167)")
                chart = new Chart(ctx, 
                    graphHandler.createBarGraph(
                        points,
                        "FRC Rank", //x axis title
                        "Avg Score" //y axis title
                    )
                )
        }
    } 

    function incrementChart() {
        if(currentChart == 5) {
            currentChart = 0
            return
        }
        currentChart++
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
        incrementChart()
        drawChart(currentChart)
    })

    //when the update button is clicked, redraw the graph
    const updateButton = document.getElementById("update-graph")

    updateButton.addEventListener("click", async () => {
        //animate the button click effect
        updateButton.style.backgroundColor = "#3b86cc"
        updateButton.style.boxShadow = "0 2px #1c3750"
        updateButton.style.transform = "translateY(4px)"

        //make new graph
        getChart(scatterChart, "api_rank", "avg_gm_score", "rgb(81, 121, 167)")


        //animate the button back
        setTimeout(() => {
            updateButton.style.backgroundColor = "#3492EA"
            updateButton.style.boxShadow = "0 6px #3077b9"
            updateButton.style.transform = ""
        }, 100); //in milliseconds
    })
}

