import dotenv from "dotenv"
import SQL from "sql-template-strings"
import casdoorSDK from "./auth/auth.js"

dotenv.config()

const log = Number(process.env.LOG)
const debugLog = Number(process.env.TRACE_LOG) //shows where console logs came from

function arrAvg(...args) {
    return args.reduce((total, val) => total + val) / args.length
}

const logoutMS = 7 * 24 * 60 * 60 * 1000 

function consoleLog(...args) {
    if (log) {
        console.log(...args)
        if (debugLog) {
            console.trace()
        }
    }
}

async function checkAdmin(req) {
    const database = await import("./database/database.js")
    const username = casdoorSDK.parseJwtToken(req.cookies.u_token).name

    try {
        const [err, dbR] = await database.query(SQL`SELECT um.um_admin_f FROM user_master um WHERE um.um_casdoor_userid = ${username};`)
        
        if (err) throw err

        if (dbR[0].um_admin_f == 1) { //is admin
            return true
        }
    } catch(err) {
        console.log("err while checking if admin: ", err)
    }
    
    return false
}

function suggestTeam(currentAlliance, otherAlliances) {
    const teamStats = {
        gameScore: arrAvg(...currentAlliance.map(t => t.gameScore)),
        links: arrAvg(...currentAlliance.map(t => t.links)),
        autonDock: arrAvg(...currentAlliance.map(t => t.autonDock)),
        endGameDock: arrAvg(...currentAlliance.map(t => t.endGameDock)),
    }
    /*
    const GSRank = rank(data.map(e => e.avg_gm_score))
    const linkRank = rank(data.map(e => e.avg_nbr_links))
    const autonCSRank = rank(data.map(e => e.avg_auton_chg_station_score))
    const endGameCSRank = rank(data.map(e => e.avg_endgame_chg_station_score))
    */
}

/*convert rowDataPAcket to array*/
function parseData(info) {
    return JSON.parse(JSON.stringify(info))
}

export { checkAdmin, consoleLog, suggestTeam, parseData, logoutMS }
