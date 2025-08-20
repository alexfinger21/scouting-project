const express = require("express")
const gameConstants = require("../game.js")
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

//GET USERNAME
router.get("/getUsername", async (req, res) => {
    consoleLog("COOKIES", req.cookies)
    let [err, dbRes] = await database.query(SQL`SELECT * FROM teamsixn_scouting_dev.user_master um WHERE um.um_id = ${req.cookies["username"]};`)
    
    consoleLog("DB RES", dbRes)
    const user = JSON.parse(JSON.stringify(dbRes))
    if (user?.length > 0) {
        return res.send({username: user[0]["um_name"], comp: gameConstants.COMP})
    }

    return res.send("unknown")
})

router.get("/getMatchTeams", function (req, res) {
    consoleLog("request recieved!")
    database.query(database.getTeams(), (err, runningMatchResults) => {
        //consoleLog(JSON.parse(JSON.stringify(runningMatchResults)))
        res.status(200).send(JSON.parse(JSON.stringify(runningMatchResults)))
    })
})

module.exports = router
