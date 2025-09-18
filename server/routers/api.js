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
            runningMatch = runningMatchResults[0].cg_gm_number
            res.status(200).send({ match: runningMatch })
        } else {
            res.status(200).send({ match: 0 })
        }
    })
})

router.get("/getUserInfo", function (req, res) {
    const user = casdoorSdk.parseJwtToken(req.cookies.u_token)

    return res.send({
        user, 
        comp: gameConstants.COMP
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
