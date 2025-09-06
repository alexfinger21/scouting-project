import express from "express"
import { checkAdmin } from "../utility.js"

const router = express.Router()

router.get("/", async (req, res) => {
    const isAdmin = await checkAdmin(req)
    console.log("IS ADMIN", isAdmin)
    return res.render("template", {isAdmin: isAdmin})
})

export default router
