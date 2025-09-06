import express from "express"
import database from "../database/database.js"
import { consoleLog, checkAdmin } from "../utility.js"

const router = express.Router()
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function addZero(num) {
    return num < 10 ? "0" + String(num) : String(num)
}

router.get("/", async function (req, res) {
    
    consoleLog("GET request for match verify")
    database.query(database.getMatchVerify(), async (err, results) => {
        //get isAdmin
        consoleLog(err)
        consoleLog("MATCH VERIFY DATA: ")
        consoleLog(results)
        const isAdmin = await checkAdmin(req)

        if(!isAdmin) {
            return res.redirect("/data-collection")
        }

        //get teams 
        const teams = {}

        for (let i = 0; i < results.length; i++) {
            const currentTeam = results[i]

            teams[i] = currentTeam

            const date = new Date(teams[i].gm_timestamp)
            const month = months[date.getUTCMonth()]
            const day = date.getDate()
            const h = addZero(date.getHours())
            const m = addZero(date.getMinutes())
            teams[i].time = month + " " + day + ", " + h + ":" + m

            //consoleLog(teams[i])
        }

        teams.length = Object.keys(teams).length

        consoleLog("Rendering match listing")
        //consoleLog(teams)

        res.render("match-verify", {
            teams: teams, 
        })
    })
})

router.post("/", function (req, res) { //admin presses save button
    database.query(database.removeMatchup(), (err, results) => {
        consoleLog("removed matchup")
        database.query(database.addMatchup(), (err, results) => {
            consoleLog("Added the matchup")
        })
    })
})

export default router
