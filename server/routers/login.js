import express from "express"
import crypto from "crypto"
import database from "../database/database.js"
import { consoleLog, logoutMS } from "../utility.js"
import SQL from "sql-template-strings"
import dotenv from "dotenv"
import argon2 from "argon2"
import casdoorSdk from "../auth/auth.js"

const router = express.Router()

dotenv.config()

async function checkUser(body) {
    const [err, dbRes] = await database.query(SQL`
        SELECT * 
        FROM user_master um 
        WHERE um.um_id = ${body.username} 
            AND team_master_tm_number = ${body.team_number};
        `)
    if (err)
        throw err;

    //consoleLog("RESULT: " + result)
    if (dbRes.length == 1) {
        const result = dbRes[0]

        if (argon2.verify(result.um_password, body.password)) {
            return true
        }

    }

    return false
}

function strongRandomString(chars, maxLen) {
    const randomBytes = crypto.randomBytes(chars.length)
    let res = ""

    for (let i = 0; i<maxLen; ++i) {
        res += chars[randomBytes[i] % chars.length]
    }

    return res
}

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

router.get("/", function (req, res) {
    return res.render("login", {error: "visible"})
})

export default router
