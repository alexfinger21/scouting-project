require('dotenv').config()
const log = Number(process.env.LOG)
const debugLog = Number(process.env.TRACE_LOG) //shows where console logs came from
const SQL = require('sql-template-strings')

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

function checkAdmin(req) {
    const database = require("./database/database.js")
    const username = req.cookies["username"]
    return new Promise((resolve) => {
        database.query(SQL`SELECT um.um_admin_f FROM user_master um WHERE um.um_id = ${username};`, function (error, results) {
            if (error)
                throw error;

            consoleLog(results[0].um_admin_f == true)
            if (results[0].um_admin_f == 1) { //is admin
                resolve(true)
            }

            resolve(false)
        })
    })
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

module.exports = { checkAdmin: checkAdmin, consoleLog: consoleLog, suggestTeam: suggestTeam, parseData: parseData, logoutMS }
