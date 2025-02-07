import { paths } from "./utility"
const ctx = document.getElementById("chartForDA")

console.log("yo bro you done not Messed up")
/*
function hh ()
{

    $.ajax({
        type: "GET",
        contentType: "application/json",
        url: paths.dataAccuracy + "?combinedData=true",
        data: JSON.stringify({}),
        success: function (response) {
            consoleLog("response:\n")
            consoleLog(response)
        }})
    let somedata = []

    // for(let i = 1; i <= Object.keys(temp).length; i++)
    // {
    //     somedata.push({x:temp[i].red.matchStats.teleopSpeakerNoteCount.TBA,
    //         y: temp[i].red.matchStats.teleopSpeakerNoteCount.DB})
    // }
    return somedata
}
*/
function loadChart() { //only initialize chart once window loads completely to avoid context issues            
    const DAChart = new Chart(
        ctx, 
        {
            type: "scatter",
            data: {
                datasets: [{
                    pointRadius: 4,
                    pointBackgroundColor: "pink",
                //data: hh()
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