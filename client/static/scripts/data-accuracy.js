import { paths, consoleLog } from "./utility.js"
const ctx = document.getElementById("chartForDA")

console.log("yo bro you done not messed up")


function hh () {
    return new Promise((res, rej) => { 
        const somedata = []

        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: paths.dataAccuracy + "?get-data=true",
            success: function (response) {
                consoleLog("response:\n")
                consoleLog(response)
                response = JSON.parse(response)

                for(let i = 1; i <= Object.keys(response).length; i++)
                {
                    somedata.push({x:response[i].red.matchStats.teleopSpeakerNoteCount.TBA,
                        y: response[i].red.matchStats.teleopSpeakerNoteCount.DB})
                }
                return res(somedata)
            }})
    })
}

async function loadChart() { //only initialize chart once window loads completely to avoid context issues            
    const DAChart = new Chart(
        ctx, 
        {
            type: "scatter",
            data: {
                datasets: [{
                    pointRadius: 4,
                    pointBackgroundColor: "pink",
                data: await hh()
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