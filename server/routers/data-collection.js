const user = require("../user")
const database = require("../database/database.js")
const express = require("express")
const { checkAdmin } = require("../utility")
const router = express.Router()

router.get("/", async function (req, res) { //only gets used if the url == data-collection
    const isAdmin = await checkAdmin(req)
    const username = req.cookies["username"]
    let runningMatch = -1;
    database.query(`select * from teamsixn_scouting_dev.current_game;`, (err, runningMatchResults) => {
        console.log(runningMatchResults)
        if (runningMatchResults[0]) { //if a match is running
            runningMatch = runningMatchResults[0].cg_gm_number
        }
        console.log(database.getAssignedTeam(username))
        database.query(database.getAssignedTeam(username), (err, assignment) => {
            console.log("GO\n\n\n")
            console.log(assignment)
            assignment = JSON.parse(JSON.stringify(assignment))[0] //convert rowDataPacket to object
            console.log(assignment)
            res.render("data-collection", {
                runningMatch,
                user: user,
                assignment: assignment,
                isAdmin: isAdmin
            })
        })
    })
})

router.post("/", function (req, res) {
    const body = req.body
    body.username = req.cookies["username"]
    console.log(body)

    database.query(database.saveData(body), (err, results) => {
        console.log(err)
        console.log(results)
    })

    return res.send("req recieved")
})

module.exports = router