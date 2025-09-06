import express from "express"
import { checkAdmin } from "../utility.js"

const router = express.Router()

router.get("/", async (req, res) => {
    const isAdmin = await checkAdmin(req)
    return res.render("template", {isAdmin: isAdmin})
})

export default router
