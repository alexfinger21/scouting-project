const user = require("../user")
const express = require("express")
const { checkAdmin } = require("../utility")
const router = express.Router()

router.get("/",  async function(req, res) { //only gets used if the url == data-collection
    const isAdmin = await checkAdmin(req)
    let runningMatch = 0;
    database.query(`select * from teamsixn_scouting_dev.current_game;`, (err, runningMatchResults) => {
        runningMatch = runningMatchResults[0].cg_gm_number
    })
    res.render("data-collection", {
        runningMatch,
        user: user,
        isAdmin: isAdmin
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log("req recieved")
    return res.send("req recieved")
})

module.exports = router