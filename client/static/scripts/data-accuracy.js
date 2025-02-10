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


/*work in progress*/

function calculateRegression (data) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    data.forEach(point => {
        sumX += point.x;
        sumY += point.y;
        sumXY += point.x * point.y;
        sumX2 += point.x * point.x;
    });

    const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const a = (sumY - b * sumX) / n;
    return {a, b};
};
const regressionLine = (data) => {
    const {a, b} = calculateRegression(data.datasets[0].data);
    const xValues = data.datasets[0].data.map(point => point.x);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);

    return {
        label: 'Regression Line',
        data: [{x: minX, y: a + b * minX}, {x: maxX, y: a + b * maxX}],
        type: 'line',
        borderColor: 'red',
        borderWidth: 2,
        pointRadius: 0,
        
    }
}


async function main() {//only initialize chart once window loads completely to avoid context issues    
    const ctx = document.getElementById("chart1")
    const ctx2 = document.getElementById("chart2")        
    const data = await backEndData()
    const somedata = []
    const somedataBlue = []
    let maxht = 18

    for(let i = 1; i <= Object.keys(data).length; i++)
        {
            somedata.push({x:data[i].red.matchStats.teleopSpeakerNoteCount.TBA,
                y: data[i].red.matchStats.teleopSpeakerNoteCount.DB})
            somedataBlue.push({x:data[i].blue.matchStats.teleopSpeakerNoteCount.TBA,
                y: data[i].blue.matchStats.teleopSpeakerNoteCount.DB})
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
                }],
                showLine: true,
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
                        title: {
                            display: true,
                            text: 'TBA DATA' // This will label the X axis
                        },
                        max: maxht,
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'DB DATA' // This will label the X axis
                        },
                        max: maxht,
                    },
                },
                plugins: {
                    legend: {
                      display: false,
                    },
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
                data: somedataBlue
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
                        title: {
                            display: true,
                            text: 'TBA DATA' // This will label the X axis
                        },
                        max: maxht,
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'DB DATA' // This will label the X axis
                        },
                        max: maxht,
                    },
                },
                plugins: {
                    legend: {
                      display: false,
                    },
                  }
            }                                                     

    });
}