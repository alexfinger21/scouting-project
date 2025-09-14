import express from "express"
import crypto from "crypto"
import database from "../database/database.js"
import { consoleLog, logoutMS } from "../utility.js"
import SQL from "sql-template-strings"
import dotenv from "dotenv"
import casdoorSdk from "../auth/auth.js"
const router = express.Router()

dotenv.config()

router.post("/", function (req, res) {
    const body = req.body
    const code = body.code
    casdoorSdk.getAuthToken(code).then(sdk_res => {
        const accessToken = sdk_res.access_token || null

        res.cookie("u_token", accessToken, {
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            // expires works the same as the maxAge
            httpOnly: true,
        })

        res.send({
            token: accessToken
        })
    }) 
})
//connection.end();
router.get("/", function (req, res) {
    return res.render("login", {error: "visible"})
})


export default router
