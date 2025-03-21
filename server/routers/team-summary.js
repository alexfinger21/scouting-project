const express = require("express")
const database = require("../database/database.js")
const { checkAdmin, consoleLog } = require("../utility")
const router = express.Router()

router.get("/",  async function(req, res) { //only gets used if the url == team-summary
    const getData = req.query.getData
    const t1 = Date.now()
    if(getData == 1) {
        database.query(database.getChartData(), (err, chartData) => {
            consoleLog("time to wait: ", Date.now() - t1 + "ms")
            consoleLog(err)
            res.status(200).send(JSON.stringify(chartData))
        })
    }
    else {
        const isAdmin = await checkAdmin(req)
        database.query(database.getChartData(), (err, chartData) => {
            consoleLog("time to wait: ", Date.now() - t1 + "ms")
            const len = JSON.parse(JSON.stringify(chartData)).length
            res.render("team-summary", {
                isAdmin: isAdmin,
                numPoints: len
            })
        })
    }

})

router.post("/", function(req, res) {
    const body = req.body
    consoleLog(body)

    
})

module.exports = router
