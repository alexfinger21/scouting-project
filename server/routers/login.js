const express = require("express")
const router = express.Router()

const testUser = {
    team_number: 695,
    username: "alex", 
    password: "npc"}

router.get("/", function(req, res) {
    res.render("login")
})

router.post("/", function(req, res) {
    //TO DO - SQL QUERY TO RETRIEVE THE USER
    const body = req.body

    if (req.body.username == testUser.username) {
        if (req.body.password == testUser.password) {
            if (req.body.team_number == testUser.team_number) {
                //successful login
                res.redirect("data-collection")
            }
        }
    }
})

module.exports = router