const user = require("../user")
const express = require("express")
const router = express.Router()

const matches = [1, 2, 3, 4]

const testInfo1 = {
    undecided: true,
    redPredictedScore: 42,
    bluePredictedScore: 32.7,
    teamData: [ //TEST data
        //team, alliance color,  avg hangar points, avg scoring, defensive score
        [4269, "red", 6, 15, 5],
        [6834, "red", 3, 12, 34],
        [325, "red", 3, 213, 34],
        [3324, "blue", 3, 12, 34],
        [3484, "blue", 1, 12, 34],
        [6936, "blue", 3, 12, 34],
    ],
    blueStrategy: [
        "Team <b> 3324 </b> defends team <em> 4269 </em>",
        "Team <b> 3484 </b> attempts to score",
        "Team <b> 5936 </b> attempts to score"
    ],
    redStrategy: [
        "Team <em> 4269 </em> attempts to score",
        "Team <em> 6834 </em> defends team <b> 3484 </b>",
        "Team <em> 325 </em> attempts to score"
    ]
}

const testInfo2 = {
    undecided: false,
    redScore: 50,
    blueScore: 30,
    teamData: [ //TEST data
        //team, alliance color, hangar points, scoring, defensive score
        [4269, "red", 6, 15, 5],
        [6834, "red", 3, 12, 34],
        [5324, "red", 3, 213, 34],
        [1233, "blue", 3, 12, 34],
        [2134, "blue", 1, 12, 34],
        [3431, "blue", 3, 12, 34],
    ]
}

const undecidedTableLabels = [
    "Avg Hangar Pts",
    "Avg Scoring",
    "Defensive Score"
]

const decidedTableLabels = [
    "Hangar Pts",
    "Scoring",
    "Defensive Score"
]

router.get("/",  function(req, res) { //only gets used if the url == match-strategy
    res.render("match-strategy", {
        matches: matches,
        info: testInfo1,
        undecidedTableLabels: undecidedTableLabels,
        decidedTableLabels: decidedTableLabels,
        user: user,
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log(body)
})

module.exports = router