const user = require("../user")
const database = require("../database/database.js")
const express = require("express")
const { checkAdmin } = require("../utility")
const { deleteData } = require("../database/database.js")
const router = express.Router()

router.get("/", async function (req, res) { //only gets used if the url == data-collection
    const isAdmin = await checkAdmin(req)
    let runningMatch = -1;
    database.query(`select * from teamsixn_scouting_dev.current_game;`, (err, runningMatchResults) => {
        console.log(runningMatchResults)
        if (runningMatchResults[0]) { //if a match is running
            runningMatch = runningMatchResults[0].cg_gm_number
        }
        database.query(`select * from teamsixn_scouting_dev.current_game_user_assignment;`, (err, userAssignments) => {
            userAssignments = JSON.parse(JSON.stringify(userAssignments)) //convert rowDataPacket to object
            let userValues
            console.log(userAssignments)

            for (let i = 0; i < 6; i++) {
                if (userAssignments[i].cgua_user_id == req.cookies["user_id"]) {
                    userValues = userAssignments[i]
                }
            }

            console.log(userValues)

            res.render("data-collection", {
                runningMatch,
                user: user,
                userValues: userValues,
                isAdmin: isAdmin
            })
        })
    })
})

router.post("/", function (req, res) {
    const body = req.body
    body.username = req.cookies["username"]
    console.log(body)

    database.query(database.deleteData(body), (err, results) => {
        console.log(err)
        console.log(results)
    })

    database.query(database.saveData(body), (err, results) => {
        console.log(err)
        console.log(results)
    })

    return res.send("req recieved")
})

module.exports = router