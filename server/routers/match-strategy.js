const express = require("express")
const router = express.Router()

const matches = [
    {occured: true, id: "1", winner: "red"},
    {occured: true, id: "2", winner: "blue"},
    {occured: false, id: "3", winner: "undecided"},
    {occured: false, id: "4", winner: "undecided"},
]

const teamData = [ //TEST data
    //team, alliance color,  avg hangar points, avg scoring, defensive score
    [4269, "red", 6, 15, 5],
    [6834, "red", 3, 12, 34],
    [5324, "red", 3, 213, 34],
    [1233, "blue", 3, 12, 34],
    [2134, "blue", 1, 12, 34],
    [3431, "blue", 3, 12, 34],
]

const tableLabels = [
    "Avg Hangar Pts",
    "Avg Scoring",
    "Defensive Score"
]

router.get("/",  function(req, res) { //only gets used if the url == match-strategy
    res.render("match-strategy", {
        matches: matches,
        teamData: teamData,
        tableLabels: tableLabels
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log(body)
})

module.exports = router