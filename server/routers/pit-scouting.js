import express from "express"
const router = express.Router()

router.get("/", (req, res) => {
    return res.render("pit-scouting-iframe")
})

export default router
