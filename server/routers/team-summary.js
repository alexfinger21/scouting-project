const user = require("../user")
const express = require("express")
const database = require("../database/database.js")
const { checkAdmin } = require("../utility")
const router = express.Router()

router.get("/",  async function(req, res) { //only gets used if the url == team-summary
    const getData = req.query.getData
    if(getData == 1) {
        database.query(database.getChartData(), (err, chartData) => {
            console.log(err)
            console.log("CHART DATA: ")
            console.log(chartData)
            res.status(200).send({chartData: chartData})
        })
    }
    else {
        const isAdmin = await checkAdmin(req)
        res.render("team-summary", {
            user: user,
            isAdmin: isAdmin
        })
    }

})

router.post("/", function(req, res) {
    const body = req.body
    console.log(body)

    
})

module.exports = router