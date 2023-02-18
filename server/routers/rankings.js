const user = require("../user")
const { returnAPIDATA } = require("../getRanks")
const express = require("express")
const { checkAdmin } = require("../utility")
const router = express.Router()

router.get("/",  async function(req, res) { //only gets used if the url == team-summary
    const isAdmin = await checkAdmin(req)
    const teamStats = await returnAPIDATA()
    
    res.render("rankings", {
        user: user,
        isAdmin: isAdmin,
        year: 2023,
        eventCode: 'test',
        timeStamp: '5:44PM',
        teamStats: teamStats.Rankings
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log(body)

    
})

module.exports = router