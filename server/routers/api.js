import express from "express"
import gameConstants from "../game.js"
import { consoleLog } from "../utility.js"
import database from "../database/database.js"
import SQL from "sql-template-strings"
import casdoorSdk from "../auth/auth.js"

const router = express.Router()

//GET MATCH
router.get("/getMatch", function (req, res) {
    consoleLog(req.body)
    database.query(SQL`select * from teamsixn_scouting_dev.current_game;`, (err, runningMatchResults) => {
        if (runningMatchResults[0]) { //if a match is running
            const runningMatch = runningMatchResults[0].cg_gm_number
            res.status(200).send({ match: runningMatch })
        } else {
            res.status(200).send({ match: 0 })
        }
    })
})

router.get("/getUserInfo", async function (req, res) {
    const cookieToken = req.cookies.u_token
    const headerToken = req.get("Authorization")

    const user = casdoorSdk.parseJwtToken(cookieToken?.length > 0 ? cookieToken : headerToken) 
    let scoutifyUser = null

    try {
        const [err, dbR] = await database.query(SQL`SELECT * FROM user_master um WHERE um.um_id = ${user?.name};`)
        
        if (err) throw err

        scoutifyUser = dbR[0]
    } catch(err) {
        console.log("err while trying to access user: ", err)
    }


    return res.send({
        name: user.name,
        preferred_username: user.preferred_username,
        picture: user.picture,
        email: user.email,
        android_id: scoutifyUser.um_android_device_id,
    })
})

router.get("/getMatchTeams", function (req, res) {
    consoleLog("request recieved!")
    database.query(database.getTeams(), (err, runningMatchResults) => {
        //consoleLog(JSON.parse(JSON.stringify(runningMatchResults)))
        res.status(200).send(JSON.parse(JSON.stringify(runningMatchResults)))
    })
})

export default router
