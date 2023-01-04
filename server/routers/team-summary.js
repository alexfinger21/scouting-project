const express = require("express")
const router = express.Router()

const user = { //TEST USER
    team_number: 695,
    username: "alex",
    password: "npc",
    admin: true,
}

router.get("/",  function(req, res) { //only gets used if the url == team-summary
    res.render("team-summary", {
        user: user
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log(body)

    
})

module.exports = router