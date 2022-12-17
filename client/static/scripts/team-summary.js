import {clamp, dataCollectionPath} from "./utility.js"

const observer = new MutationObserver(function(mutations_list) {
	mutations_list.forEach(function(mutation) {
		mutation.removedNodes.forEach(function(removed_node) {
			if(removed_node.id == 'page-holder') {
				main()
			}
		});
	});
});

observer.observe(document.body, { subtree: false, childList: true });

function main() {
    const letterOptions = [
        "l",
        "t"
    ]
    
    letterOptions[2]
    
    const colorOptions = [
        "red",
        "green",
        "yellow"
    ]
    
    function selectRandom(obj)
    {
        let num =  obj[Math.round(Math.random() * (obj.length - 1))]
        return num
    }
    
    function getColor(color)
    {
        if(color == "red")
        {
            return "rgb(255,0,0)"
        }
        else if(color == "yellow")
        {
            return "rgb(255,245,0)"
        }
        else
        {
            return "rgb(0,255,0)"
        }
    }
    
    
    function generatePoint() {
        const img = new Image()
    
        let letter = selectRandom(letterOptions)
        let color = selectRandom(colorOptions)
    
        img.src = "../static/images/letters/" + letter + "/" + color + ".png"
        console.log(img.src)
        img.height = 15
        img.width = 12
    
        let teamName = "Team " +  Math.round(Math.random() * 9999)

        return {teamName, x: Math.round(Math.random() * 50), y: Math.round(Math.random() * 50), shape: img, color: getColor(color) }
    }
    
    let points = []
    for(let i = 0; i < 10; i++)
    {
        points.push(generatePoint())
    }
    
    const ctx = document.getElementById('teamSummaryChart').getContext('2d')
    let scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            teamName: points.map(p => p.teamName),
            datasets: [{
                label: 'Legend',
                pointRadius: 4,
                pointStyle: points.map(p => p.shape),
                borderColor: points.map(p => p.color),
                pointBackgroundColor: points.map(p => p.color),
                data: points
            }]
        },
        options: {
            tooltips: {
                bodyFontStyle: "bold",
                footerFontStyle: "normal",
                callbacks: {
                    label: function (tooltipItem, data) {
                        let teamName = data.teamName[tooltipItem.index];
                        let text = [teamName + ": (" + tooltipItem.xLabel + ', ' + tooltipItem.yLabel + ")"]
                        return text;
                    },
                    //color does not appear before the footer
                    footer: function (tooltipItems, data) {
                        return [
                            "Plays Defense: ✅",
                            "Avg. Auto Score: 4",
                            "Avg. Tele-op Score: 2",
                            "Avg. Endgame Score: 15"
                        ]
                    }
                }
            },
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
        }
    })
}
window.addEventListener("load", main)

