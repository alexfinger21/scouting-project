import { paths, consoleLog, checkPage } from "./utility.js"
consoleLog("yo bro you done not messed up")

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(async function (mutation) {
        for (const removed_node of mutation.removedNodes) {
            if (removed_node.id == 'page-holder' && checkPage(paths.dataAccuracy)) {
                main()
                break
            }
        }
    })
})

observer.observe(document.body, { subtree: false, childList: true });


function backEndData() {
    return new Promise((res, rej) => {
        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: paths.dataAccuracy + "?get-data=true",
            success: function (response) {
                //consoleLog("response:\n")
               // consoleLog(response)
                response = JSON.parse(response)

                return res(response)
            }})
    })
}

async function main() {//only initialize chart once window loads completely to avoid context issues    
    const ctx = document.getElementById("chart1")
    const ctx2 = document.getElementById("chart2")        
    const data = await backEndData()
    const somedata = []
    let maxht = 18

    for(let i = 1; i <= Object.keys(data).length; i++)
        {
            somedata.push({x:data[i].red.matchStats.teleopSpeakerNoteCount.TBA,
                y: data[i].red.matchStats.teleopSpeakerNoteCount.DB})
        }

    
    const DAChart = new Chart(
        ctx, 
        {
            type: "scatter",
            label: "hi",
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
                    text: 'RED TELEOP SPEAKER NOTE COUNT'
                },
                legend: { display: false },
                aspectRatio: 1,
                scales: {
                    x: {
                        max: maxht,
                    },
                    y: {
                        max: maxht,
                    }
                }
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
                    text: 'BLUE TELEOP SPEAKER NOTE COUNT'
                },
                legend: { display: false },
                aspectRatio: 1,
                scales: {
                    x: {
                        max: maxht,
                    },
                    y: {
                        max: maxht,
                    }
                }
        }
    });
}