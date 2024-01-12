const express = require("express")
const router = express.Router()
const { consoleLog } = require("../utility")

router.get("/", function (req, res) {
    res.render("game-strategy")
})

module.exports = router
