const express = require("express")
const router = express.Router()

const teams = { //TEST TEAMS
    
}

router.get("/",  function(req, res) { //only gets used if the url == alliance-selector
    res.render("alliance-selector", {
        teams
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log(body)
})

module.exports = router