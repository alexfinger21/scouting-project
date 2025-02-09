import { paths, consoleLog } from "./utility.js"
const ctx = document.getElementById("chartForDA")
const ctx2 = document.getElementById("chart2")

consoleLog("yo bro you done not messed up")


function backEndData() {
    return new Promise((res, rej) => {
        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: paths.dataAccuracy + "?get-data=true",
            success: function (response) {
                consoleLog("response:\n")
                consoleLog(response)
                response = JSON.parse(response)

                return res(response)
            }})
    })
}

async function loadChart() {//only initialize chart once window loads completely to avoid context issues            
    const data = await backEndData()
    const somedata = []

    for(let i = 1; i <= Object.keys(data).length; i++)
        {
            somedata.push({x:data[i].red.matchStats.teleopSpeakerNoteCount.TBA,
                y: data[i].red.matchStats.teleopSpeakerNoteCount.DB})
        }

    
    const DAChart = new Chart(
        ctx, 
        {
            type: "scatter",
            data: {
                datasets: [{
                    pointRadius: 4,
                    pointBackgroundColor: "RED",
                data: somedata
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'TOTAL SCORE - SCENARIO'
                },
                legend: { display: false },
        }
    });

    const DAChart1 = new Chart(
        ctx2, 
        {
            type: "scatter",
            data: {
                datasets: [{
                    pointRadius: 4,
                    pointBackgroundColor: "BLUE",
                data: somedata
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'TOTAL SCORE - SCENARIO'
                },
                legend: { display: false },
        }
    });
}

window.addEventListener("load", loadChart);