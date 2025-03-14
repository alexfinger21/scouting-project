const express = require("express")
const router = express.Router()
const { consoleLog } = require("../utility")
const { combinedData } = require("../dataAccuracy")

router.get("/", async function (req, res) {
    consoleLog("RENDERING DATA ACCURACY")
    if (req.query["get-data"] == "true") {
        const data = await combinedData()
        consoleLog("QUERY DATA", req.query, data)
        return res.send(data)
    } else {
        return res.render("data-accuracy")
    }
})

module.exports = router
