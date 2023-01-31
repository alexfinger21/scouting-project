const user = require("../user")
const express = require("express")
const { checkAdmin } = require("../utility")
const router = express.Router()

router.get("/",  async function(req, res) { //only gets used if the url == team-summary
    const isAdmin = await checkAdmin(req)
    res.render("team-summary", {
        user: user,
        isAdmin: isAdmin
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log(body)

    
})

module.exports = router