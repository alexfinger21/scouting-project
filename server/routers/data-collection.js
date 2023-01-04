const user = require("../user")
const express = require("express")
const router = express.Router()

router.get("/",  function(req, res) { //only gets used if the url == data-collection
    res.render("data-collection", {
        user: user
    })
})

router.post("/", function(req, res) {
    const body = req.body
    console.log(body)

    
})

module.exports = router