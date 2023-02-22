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


async function getChart(scatterChart, x, y, color) {
    const data = await requestData(paths.teamSummary + "?getData=1")
    let points = new Array(Array.from(data).length)
    for (const val of data) {
        points.push({
            teamName: val.tm_name,
            x: val[x],
            y: val[y] ? val[y] : 0,
            color: color
        })
    }
    scatterChart.data = graphHandler.writeData(points)
    scatterChart.update()
}


function main() {
    //create a point array
    let points = []
    for (let i = 0; i < 10; i++) {
        points.push(graphHandler.generatePoint())
    }

    //write point array to a scatterplot
    const ctx = document.getElementById("teamSummaryChart").getContext("2d")
    let scatterChart = new Chart(ctx, graphHandler.createGraph(points, "scatter", "FRC Rank", "Avg Score"))

    //when the arrows are clicked, draw a new graph
    const arrowLeft = document.getElementById("arrow-left")
    arrowLeft.addEventListener("click", async () => {
        getChart(scatterChart, "api_rank", "avg_gm_score", "rgb(81, 121, 167)")
    })

    //when the update button is clicked, redraw the graph
    const updateButton = document.getElementById("update-graph")

    updateButton.addEventListener("click", async () => {
        //animate the button click effect
        updateButton.style.backgroundColor = "#3b86cc"
        updateButton.style.boxShadow = "0 2px #1c3750"
        updateButton.style.transform = "translateY(4px)"

        //create a new point array
        const data = await requestData(paths.teamSummary + "?getData=1")
        let points = new Array(Array.from(data).length)
        for (const val of data) {
            points.push({
                teamName: val.tm_name,
                x: val.api_rank,
                y: val.avg_gm_score ? val.avg_gm_score : 0,
                color: "rgb(255,0,0)"
            })
        }
        scatterChart.data = graphHandler.writeData(points)
        scatterChart.update()

        //animate the button back
        setTimeout(() => {
            updateButton.style.backgroundColor = "#3492EA"
            updateButton.style.boxShadow = "0 6px #3077b9"
            updateButton.style.transform = ""
        }, 100); //in milliseconds
    })
}

