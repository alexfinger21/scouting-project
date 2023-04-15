const express = require("express")
const database = require("../database/database.js")
const { checkAdmin, consoleLog } = require("../utility")
const router = express.Router()

router.get("/",  async function(req, res) { //only gets used if the url == team-summary
    const getData = req.query.getData
    if(getData == 1) {
        database.query(database.getChartData(), (err, chartData) => {
            consoleLog(err)
            //consoleLog("CHART DATA: ")
            //consoleLog(chartData)
            res.status(200).send(JSON.stringify(chartData))
        })
    }
    else {
        const isAdmin = await checkAdmin(req)
        res.render("team-summary", {
            isAdmin: isAdmin
        })
    }

})

router.post("/", function(req, res) {
    const body = req.body
    consoleLog(body)

    
})

module.exports = router