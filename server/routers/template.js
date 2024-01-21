const express = require("express")
const { checkAdmin } = require("../utility")
const router = express.Router()

router.get("/", async (req, res) => {
    const isAdmin = await checkAdmin(req)
    return res.render("template", {isAdmin: isAdmin})
})

module.exports = router
