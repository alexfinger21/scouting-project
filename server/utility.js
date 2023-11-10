const database = require("./database/database.js")
const log = true

function rank(arr) {
    const arraySorted = arr.slice().sort((a, b) => b - a)
    return arr.map(v => {
        return arraySorted.indexOf(v)
    })
}

function arrAvg(...args) {
    return args.reduce((total, val) => total+val)/args.length
}

function consoleLog(arg) {
    if (toString(arg).indexOf("frc_season_master_sm_year") != -1) {
        console.log("\nFOUND THE MASSIVE PRINT STATEMENT: ")
        console.trace()
        return
    }
    if (log) {
        console.log(arg)
    }
}

function checkAdmin(req) {
    const username = req.cookies["username"]
    return new Promise((resolve) => {
        database.query("SELECT um.um_admin_f FROM user_master um WHERE um.um_id = '" + username + "';", function (error, results) {
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


module.exports = { checkAdmin: checkAdmin, consoleLog: consoleLog, suggestTeam: suggestTeam}