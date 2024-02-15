const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
    return res.render("pit-scouting-iframe")
})

module.exports = router
