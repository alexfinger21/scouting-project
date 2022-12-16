const { createPublicKey } = require("crypto")

const T = new Image()
T.src = "https://th.bing.com/th/id/OIP.gWZUaARRArsTT9Q-PR_z8QHaHa?pid=ImgDet&rs=1"
T.height = 20
T.width = 20

const M = new Image()
M.src = "https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/letter-m-icon-18-256.png"
M.height = 15
M.width = 15
M.color = ''

const points = [
    { x: 50, y: 7, shape: T, color: 'rgb(255,0,0)' },
    { x: 10, y: 4, shape: M, color: 'rgb(0,0,255)' },
    { x: 15, y: 9, shape: 'crossRot', color: 'rgb(0,255,0)' },
    { x: 12, y: 10, shape: 'circ', color: 'rgb(255,0,255)' },
    { x: 5, y: 20, shape: 'rect', color: 'rgb(0,0,255)' },
];

new Chart("teamSummaryChart", {
    type: "scatter",
    data: {
        datasets: [{
            pointRadius: 4,
            pointStyle: points.map(p => p.shape),
            borderColor: points.map(p => p.color),
            pointBackgroundColor: points.map(p => p.color),
            data: points
        }]
    },
    options: {
        labels: ["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"],
        scales: {
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: "Team Ranking",
                },
            }],

            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: "Average Total Score",
                }
            }],
        },
        legend: {
            display: false
        },
        layout: {
            padding: {
                top: 20,
                right: 20
            }
        }
    },
    tooltipEvents: ["click"]
})