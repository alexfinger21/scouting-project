const express = require("express")
const router = express.Router()

const user = { //TEST USER
    team_number: 695,
    username: "alex",
    password: "npc"
}

router.get("/",  function(req, res) { //only gets used if the url == data-collection
    res.render("team-summary", {
        user
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log(body)

    
})

module.exports = router