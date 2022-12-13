var points = [
    { x: 50, y: 7},
    { x: 60, y: 8},
    { x: 70, y: 8},
    { x: 80, y: 9},
    { x: 90, y: 9 },
    { x: 100, y: 9 },
    { x: 110, y: 10 },
    { x: 120, y: 11 },
    { x: 130, y: 14 },
    { x: 140, y: 14 },
    { x: 150, y: 15 }
];

new Chart("teamSummaryChart", {
    type: "scatter",
    data: {
        datasets: [{
            pointRadius: 4,
            pointStyle: ["circ", "rect", "tri", "crossRot", "circ", "rect", "tri", "crossRot","circ", "rect", "tri", "crossRot",],
            borderColor: 'rgb(0,0,255)',
            pointBackgroundColor: "rgba(0,0,255,1)",
            data: points
        }]
    },
    options: {
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
            display: false,
        },
        layout: {
            padding: {
                top: 20,
                right: 20
            }
        }
    }
})