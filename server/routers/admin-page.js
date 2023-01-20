const user = require("../user")
const express = require("express")
const router = express.Router()

router.get("/",  function(req, res) {
    res.render("admin-page", {
        
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log(body)
})

module.exports = router