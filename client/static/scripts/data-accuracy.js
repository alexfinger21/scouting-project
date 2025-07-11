import { paths, consoleLog, checkPage, socket } from "./utility.js"

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

function calculateRegression(data) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    data.forEach(point => {
        sumX += point.x;
        sumY += point.y;
        sumXY += point.x * point.y;
        sumX2 += point.x * point.x;
    });

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); // slope
    const b = (sumY - m * sumX) / n; // y-intercept
    return { m, b };
}

function generateRegressionLine(data, m, b, minX, maxX) {
    const regressionData = [];
    const step = (maxX - minX) / 100;  // Create more points for smooth line

    for (let x = minX; x <= maxX; x += step) {
        const y = m * x + b;  // y = mx + b
        regressionData.push({ x, y });
    }

    return regressionData;
}

function getRegressionData (data, maxht) {
    let {m, b} = calculateRegression(data)
    let regData = generateRegressionLine(data, m, b, 0, maxht)
    return regData
}

function drawCharts(data, selectedValue, scouter, team) {
    const ctx = document.getElementById("chart1")
    const ctx2 = document.getElementById("chart2")
    
    const somedataR = []
    const somedataB = []
    let maxhtR = 0
    let maxhtB = 0


    
    for(let i = 1; i <= Object.keys(data).length; i++)
    {
        if((data[i]?.red?.scouters?.includes(scouter) || scouter == "--NO SCOUTER--") && (data[i]?.red?.teams?.includes(team) || team == "--NO TEAM--") && data[i]?.red?.matchStats?.[selectedValue]?.TBA &&  data[i]?.red?.matchStats[selectedValue]?.DB) {
            somedataR.push({
                x:data[i].red.matchStats[selectedValue].TBA,
                y: data[i].red.matchStats[selectedValue].DB, 
                match: i,
                teams: data[i].red.teams
            }) // where match is the match number and teams is the array of teams in the alliance
        }
        
        if((data[i]?.blue?.scouters?.includes(scouter) || scouter == "--NO SCOUTER--") && (data[i]?.blue?.teams?.includes(team) || team == "--NO TEAM--")&& data[i]?.blue?.matchStats?.[selectedValue]?.TBA &&  data[i]?.blue?.matchStats[selectedValue]?.DB) {
            somedataB.push({
                x:data[i].blue.matchStats[selectedValue].TBA,
                y: data[i].blue.matchStats[selectedValue].DB,
                match: i,
                teams: data[i].blue.teams
            })
        }
    }

    const maxhtRX = Math.max(...somedataR.map(point => point.x)) + 1
    const maxhtRY = Math.max(...somedataR.map(point => point.y)) + 1
    maxhtR = maxhtRX > maxhtRY ? maxhtRX : maxhtRY

    const maxhtBX = Math.max(...somedataB.map(point => point.x)) + 1
    const maxhtBY = Math.max(...somedataB.map(point => point.y)) + 1  
    maxhtB = maxhtBX > maxhtBY ? maxhtBX : maxhtBY

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
                datasets: [
                    {
                        label: 'Data Points',
                        pointRadius: 4,
                        pointBackgroundColor: "RED",
                        data: somedataR,
                        pointRadius: function(context) { // (testing for production)
                            // Dynamically adjust point radius based on overlap count 
                            const dataIndex = context.dataIndex;
                            const point = context.dataset.data[dataIndex];
                            const overlapCount = somedataR.filter(p => p.x === point.x && p.y === point.y).length;
                            
                            const minRad = 3;
                            const maxRad = 10;

                            function returnValue () {
                                if (overlapCount > maxRad)
                                    return maxRad;
                                else if (overlapCount < minRad)
                                    return minRad;
                                else 
                                    return overlapCount;
                            }

                            // Increase radius for overlapping points
                            return returnValue();
                        },
                        zIndex: 10
                    },
                    {
                        // 45-degree line
                        label: '45-degree Line',
                        data: [
                            { x: 0, y: 0 },  // Starting point
                            { x: maxhtR + 1, y: maxhtR + 1}  // End point (+1 to not show the arrow on the end of the line)
                        ],
                        borderColor: 'black',  // Color of the line
                        borderWidth: 2,  // Thickness of the line
                        fill: false,  // No fill for the line
                        showLine: true,
                        borderDash: [5, 5]  // Dashed line: [dashLength, gapLength]
                    },
                    {
                        label: 'Regression-line',
                        data: getRegressionData(somedataR, maxhtR),
                        fill: false,
                        borderColor: '#f803fc',
                        borderWidth: 2,
                        showLine: true,
                        showPoints: false,
                        borderDash: [5, 5],
                        pointRadius: 0
                    }
                ]
            },
            options: {
                title: {
                    display: true,
                    text: 'RED TELEOP SPEAKER NOTE COUNT'
                },
                legend: { display: true },
                aspectRatio: 1,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'TBA DATA', // This will label the X axis
                           
                        },
                        ticks: {
                            font: {
                                size: 16 // X-axis labels font size
                            }
                        },
                        max: maxhtR,
                        //min: 0,
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'DB DATA', // This will label the X axis
                            zIndex: 5
                        },
                        ticks: {
                            font: {
                                size: 16 // X-axis labels font size
                            }
                        },
                        max: maxhtR,
                        //min: 0,
                    },
                },
                plugins: {
                    legend: {
                      display: true,
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                // Access the data point (x, y)
                                const match = tooltipItem.raw.match; // yo i lowk dont know how this works so dont touch it
                                const teams = tooltipItem.raw.teams;

                                // Return a custom text for the tooltip
                                const customText = () => {
                                    let formattedTeams = teams.map(str => str.substring(3)).join(', ');
                                    return `Match #${match} Teams: (${formattedTeams})`
                                }

                                return customText();
                            }
                        }
                    }
            
         
                },
            }
    });

    window.DAChart1 = new Chart(
        ctx2, 
        {
            type: "scatter",
            data: {
                datasets: [
                    {
                        label: "Data Points",
                        pointRadius: 4,
                        pointBackgroundColor: "BLUE",
                        data: somedataB,
                        pointRadius: function(context) { // (testing for production)
                            // Dynamically adjust point radius based on overlap count 
                            const dataIndex = context.dataIndex;
                            const point = context.dataset.data[dataIndex];
                            const overlapCount = somedataB.filter(p => p.x === point.x && p.y === point.y).length;
                            
                            const minRad = 3;
                            const maxRad = 10;

                            function returnValue () {
                                if (overlapCount > maxRad)
                                    return maxRad;
                                else if (overlapCount < minRad)
                                    return minRad;
                                else 
                                    return overlapCount;
                            }

                            // Increase radius for overlapping points
                            return returnValue();
                        }
                    },
                    {
                        // 45-degree line
                        label: '45-degree line',
                        data: [
                            { x: 0, y: 0 },  // Starting point
                            { x: maxhtB + 1, y: maxhtB + 1}  // End point (+1 to not show the arrow on the end of the line)
                        ],
                        borderColor: 'black',  // Color of the line
                        borderWidth: 2,  // Thickness of the line
                        fill: false,  // No fill for the line
                        showLine: true,
                        borderDash: [5, 5]  // Dashed line: [dashLength, gapLength]
                    },
                    {
                        label: 'Regression-line',
                        data: getRegressionData(somedataB, maxhtB),
                        fill: false,
                        borderColor: '#f803fc',
                        borderWidth: 2,
                        showLine: true,
                        showPoints: false,
                        borderDash: [5, 5],
                        pointRadius: 0
                    }
                ]
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
                        ticks: {
                            font: {
                                size: 16 // X-axis labels font size
                            }
                        },
                        max: maxhtB,
                        //min: 0,
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'DB DATA' // This will label the X axis
                        },
                        ticks: {
                            font: {
                                size: 16 // X-axis labels font size
                            }
                        },
                        max: maxhtB,
                        //min: 0,
                    },
                },
                plugins: {
                    legend: {
                      display: true,
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                // Access the data point (x, y)
                                const match = tooltipItem.raw.match; // yo i lowk dont know how this works so dont touch it
                                const teams = tooltipItem.raw.teams;

                                // Return a custom text for the tooltip
                                const customText = () => {
                                    let formattedTeams = teams.map(str => str.substring(3)).join(', ');
                                    return `Match #${match} Teams: (${formattedTeams})`
                                }

                                return customText();
                            }
                        }
                    }
                }
            }                                                     

    });
}

// Function to convert camelCase to human-readable format
function formatOptionText(text) {
    // Capitalize the letter after a non-alphanumeric character and remove the symbol
    text = text.replace(/[^a-zA-Z0-9]+([a-zA-Z0-9])/g, (_, char) => char.toUpperCase());

    // Add space before each uppercase letter, then convert the first letter to uppercase
    return text.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, str => str.toUpperCase());
}


async function main() {  
    const data = await backEndData()
    const scouters = ["--NO SCOUTER--"]
    const teams = ["--NO TEAM--"]
    for(let i = 1; i <= Object.keys(data[1]).length; i++)
        {
            if (data?.[1]?.[i]?.blue?.scouters && data?.[1]?.[i]?.blue?.teams && data?.[1]?.[i]?.red?.scouters && data?.[1]?.[i]?.red?.teams) {
                scouters.push(...data[1][i].red.scouters)
                scouters.push(...data[1][i].blue.scouters)
                teams.push(...data[1][i].red.teams)
                teams.push(...data[1][i].blue.teams)
            }
        }
    const uniqueScoutersArray = [...new Set(scouters)].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    const uniqueTeamsArray = [...new Set(teams)]

    uniqueTeamsArray.sort((a, b) => {
        const numA = parseInt(a.substring(3), 10); // Get the number after the first 3 characters of team 'a'
        const numB = parseInt(b.substring(3), 10); // Get the number after the first 3 characters of team 'b'
        
        return numA - numB; // Sort from smallest to largest number
    })

    const dropdown = document.getElementById("DataAccuracyDropdown")
    const scoutersDrop = document.getElementById("DataAccuracyScoutersDropdown")
    const teamsDrop = document.getElementById("DataAccuracyTeamsDropdown")

   
    //Populate the dropdowns
    uniqueScoutersArray.forEach(optionText => {
        // Create a new <option> element
        const option = document.createElement("option")
    
        // Set the value and text content of the option
        option.value = optionText
        option.textContent = optionText
    
        // Append the <option> element to the dropdown
        scoutersDrop.appendChild(option)
    })
    uniqueTeamsArray.forEach(optionText => {
        // Create a new <option> element
        const option = document.createElement("option")
    
        // Set the value and text content of the option
        option.value = optionText

        if(optionText === "--NO TEAM--")
        {
            option.textContent = optionText
        }
        else
        {
            option.textContent = optionText.substring(3)
        }
    
        // Append the <option> element to the dropdown
        teamsDrop.appendChild(option)
    })
    data[0].forEach(optionText => {
        // Create a new <option> element
        const option = document.createElement("option")
    
        // Set the value and text content of the option
        option.value = optionText
        option.textContent = formatOptionText(optionText)
    
        // Append the <option> element to the dropdown
        dropdown.appendChild(option)
    })


    //draw the charts
    drawCharts(data[1], dropdown.value, scoutersDrop.value, teamsDrop.value)
    dropdown.addEventListener("change", (e) => {
        drawCharts(data[1], dropdown.value, scoutersDrop.value, teamsDrop.value)
    })
    scoutersDrop.addEventListener("change", (e) => {
        drawCharts(data[1], dropdown.value, scoutersDrop.value, teamsDrop.value)
    })
    teamsDrop.addEventListener("change", (e) => {
        drawCharts(data[1], dropdown.value, scoutersDrop.value, teamsDrop.value)
    })
}
