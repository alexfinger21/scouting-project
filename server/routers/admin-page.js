const user = require("../user")
const express = require("express")
const database = require("../database/database")
const router = express.Router()

router.get("/",  async function(req, res) {
    database.query(` SELECT um_id, um_name FROM user_master`, async (err, results) => {
        console.log(err)
        console.log(results)
        console.log([].map.call(results, (item) => {
            return {id: item.um_id, name: item.um_name}
        }))
        res.render("admin-page", {
            team: [].map.call(results, (item) => {
                return {id: item.um_id, name: item.um_name}
            })
        })
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log(body)
})

module.exports = router