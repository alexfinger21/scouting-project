const user = require("../user")
const express = require("express")
const router = express.Router()

const teams = { //TEST TEAMS
    
}

router.get("/",  function(req, res) {
    res.render("match-listing", {
        teams: teams, user: user
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log(body)
})

module.exports = router