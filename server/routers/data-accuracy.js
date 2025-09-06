import express from "express"
import { consoleLog } from "../utility.js"
import { combinedData } from "../dataAccuracy"

const router = express.Router()

router.get("/", async function (req, res) {
    consoleLog("RENDERING DATA ACCURACY")
    if (req.query["get-data"] == "true") {
        const data = await combinedData()
        consoleLog("QUERY DATA", req.query, data)
        return res.send(data)
    } else {
        return res.render("data-accuracy")
    }
})

export default router
