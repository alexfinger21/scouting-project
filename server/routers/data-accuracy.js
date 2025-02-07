const express = require("express")
const router = express.Router()
const { consoleLog } = require("../utility")
const { combinedData } = require("../dataAccuracy")

router.get("/", function (req, res) {
    if (req.query.combinedData == "true") {
        return res.send(combinedData())
    } else {
        return res.render("data-accuracy")
    }
})

module.exports = router
