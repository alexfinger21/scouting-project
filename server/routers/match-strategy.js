const user = require("../user")
const database = require("../database/database.js")
const express = require("express")
const router = express.Router()

let selectedMatch = 1

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
    "Docking",
    "Scoring",
    "Defense"
]

const decidedTableLabels = [
    "Docking",
    "Scoring",
    "Defense"
]

router.get("/",  function(req, res) { //only gets used if the url == match-strategy
    const match = req.query.match ? req.query.match : 1
    console.log("SELECTED MATCH: " + match)
    database.query(database.getGameNumbers(match), (err, gameNumbers) => {
        gameNumbers = JSON.parse(JSON.stringify(gameNumbers)) //convert RowDataPacket to object
        
        database.query(database.getMatchData(match), (err, matchup) => {
            console.log(err)
            matchup = JSON.parse(JSON.stringify(matchup)) //convert RowDataPacket to object
            console.log("\n\n MATCHUP:")
            console.log(matchup)
    
            res.render("match-strategy", {
                match: match,
                matchup: matchup,
                gameNumbers: gameNumbers,
                info: testInfo1,
                undecidedTableLabels: undecidedTableLabels,
                decidedTableLabels: decidedTableLabels,
                user: user,
            })
        })
    })
})

router.post("/", function(req, res) {
    const body = req.body
    selectedMatch = body.matchNumber
})

module.exports = router