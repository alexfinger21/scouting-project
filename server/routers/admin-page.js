const user = require("../user")
const express = require("express")
const database = require("../database/database")
const router = express.Router()

router.get("/",  async function(req, res) {
    database.query(` SELECT um_id, um_name FROM teamsixn_scouting_dev.userMaster`, async (err, results) => {
        console.log(results)
        res.render("admin-page", {
            
        })
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log(body)
})

module.exports = router