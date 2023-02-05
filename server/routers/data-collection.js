const user = require("../user")
const database = require("../database/database.js")
const express = require("express")
const { checkAdmin } = require("../utility")
const router = express.Router()

router.get("/",  async function(req, res) { //only gets used if the url == data-collection
    const isAdmin = await checkAdmin(req)
    let runningMatch = -1;
    database.query(`select * from teamsixn_scouting_dev.current_game;`, (err, runningMatchResults) => {
        console.log(runningMatchResults)
        if(runningMatchResults[0]) { //if a match is running
            runningMatch = runningMatchResults[0].cg_gm_number
        }
        database.query(`select * from teamsixn_scouting_dev.current_game_user_assignment;`, (err, userAssignments) => {
            
        })

        res.render("data-collection", {
            runningMatch,
            user: user,
            isAdmin: isAdmin
        })
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log("req recieved")
    return res.send("req recieved")
})

module.exports = router