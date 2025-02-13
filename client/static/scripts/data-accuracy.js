import { paths, consoleLog, checkPage, socket } from "./utility.js"
consoleLog("yo bro you done not messed up")

socket.on("dataAccuracy", (match_num) => {
    if (currentPage == paths.dataAccuracy) {
        requestPage(paths.dataAccuracy)
    }
})

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(async function (mutation) {
        for (const removed_node of mutation.removedNodes) {
            if (removed_node.id == 'page-holder' && checkPage(paths.dataAccuracy)) {
                //window.alert(0)
                await main();
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

function drawCharts(data, selectedValue) {
    const ctx = document.getElementById("chart1")
    const ctx2 = document.getElementById("chart2")
    const h1 = document.getElementById("first-header")

    h1.textContent = selectedValue  
    const somedata = []
    const somedataBlue = []
    let maxht = 18


    //consoleLog(selectedValue)
    for(let i = 1; i <= Object.keys(data).length; i++)
    {
        somedata.push({x:data[i].red.matchStats[selectedValue].TBA,
            y: data[i].red.matchStats[selectedValue].DB})
        somedataBlue.push({x:data[i].blue.matchStats.teleopSpeakerNoteCount.TBA,
            y: data[i].blue.matchStats.teleopSpeakerNoteCount.DB})
    }

    if (window.DAChart) {
        window.DAChart.destroy();
    }
    if (window.DAChart1) {
        window.DAChart1.destroy();
    }
        
        
    window.DAChart = new Chart(
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

    window.DAChart1 = new Chart(
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

function testDrawCharts(data, selectedValue) {
    const ctx = document.getElementById("chart1")
    const ctx2 = document.getElementById("chart2")  
    const somedata = []
    const somedataBlue = []
    let maxht = 18


    //consoleLog(selectedValue)
    for(let i = 1; i <= Object.keys(data).length; i++)
    {
        somedata.push({x:data[i].red.matchStats[selectedValue].TBA,
            y: data[i].red.matchStats[selectedValue].DB})
        somedataBlue.push({x:data[i].blue.matchStats.teleopSpeakerNoteCount.TBA,
            y: data[i].blue.matchStats.teleopSpeakerNoteCount.DB})
    }

    const data1 = {
        datasets: [
            {
            type: 'line',
            label: 'Line Dataset',
            data: [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}],
            backgroundColor: 'rgb(0, 0, 255)',
            borderColor: 'rgb(0, 0, 255)'
            },
            {
            type: 'scatter',
            backgroundColor: 'rgb(0, 0, 0)',
            borderColor: 'rgb(255, 0, 0)',
            data: somedata
            }
    
        ],
    
    };

    new Chart(ctx, {
        type: 'scatter',             
        data: data1,  
        options: {
        }       
    });
}

async function main() {  
    const data = await backEndData()

    const dropdown = document.getElementById("dropdown")
    const button = document.getElementById("test-button")
    let selectedValue = "autoSpeakerNoteCount"

            // <option value="autoAmpNoteCount">autoAmpNoteCount</option>
            // <option value="autoSpeakerNoteCount">autoSpeakerNoteCount</option>
            // <option value="teleopSpeakerNoteCount">teleopSpeakerNoteCount</option>
            // <option value="teleopAmpNoteCount">teleopAmpNoteCount</option>


    drawCharts(data, selectedValue)

    dropdown.addEventListener("click", (e) => {
        window.alert('change')
        //selectedValue = dropdown.value
        
        drawCharts(data, selectedValue)
    })  
    
    

    button.addEventListener("click", function(event) {
        // if (event.key === "Enter") {
        //     window.alert(dropdown.value)
            if(selectedValue == "autoSpeakerNoteCount")
            {
                selectedValue = "teleopSpeakerNoteCount"
                dropdown.value = selectedValue
                drawCharts(data, selectedValue)
            }
            else if(selectedValue == "teleopSpeakerNoteCount")
            {
                selectedValue = "teleopAmpNoteCount"
                dropdown.value = selectedValue
                drawCharts(data, selectedValue)
            }
            else if(selectedValue == "teleopAmpNoteCount")
            {
                selectedValue = "autoAmpNoteCount"
                dropdown.value = selectedValue
                drawCharts(data, selectedValue)
            }
            else if(selectedValue == "autoAmpNoteCount")
            {                    
                selectedValue = "autoSpeakerNoteCount"
                dropdown.value = selectedValue
                drawCharts(data, selectedValue)
            }

        //}
    });
}

window.test = function() {
    window.alert('changed');
}