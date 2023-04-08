const express = require("express")
const database = require("../database/database")
const router = express.Router()
const { consoleLog } = require("../utility")

router.get("/", async function (req, res) {
    database.query(`select 
    um.um_id ,
    concat(um.um_name," - ", um.um_id) as admin_display
    from 
    teamsixn_scouting_dev.user_master um`, async (err, teamMembers) => { //get all team members
        teamMembers = JSON.parse(JSON.stringify(teamMembers)) //convert rowDataPacket to object
        consoleLog(err)
        consoleLog(teamMembers)

        database.query(`select 
        cgua_alliance, 
        cgua_alliance_position ,
        cgua.cgua_user_id,
        concat(um.um_name," - ", cgua.cgua_user_id) as admin_display
    from 
        teamsixn_scouting_dev.current_game_user_assignment cgua 
        left join
            teamsixn_scouting_dev.user_master um 
            on
                cgua.cgua_user_id = um.um_id
    order by 
        cgua_alliance DESC, 
        cgua_alliance_position ;`, async (err, assignedUsers) => { //get currently assigned users
            consoleLog(err)
            consoleLog("assigned users::")
            consoleLog(assignedUsers)
            assignedUsers = JSON.parse(JSON.stringify(assignedUsers)) //turn rowDataPacket into an object

            consoleLog(assignedUsers)

            res.render("admin-page", {
                team: teamMembers,
                assignedUsers: assignedUsers
            })
        })
    })
})

router.post("/", function (req, res) { //admin presses save button
    const body = req.body //users and their assigned team\
    consoleLog("body:")
    consoleLog(body)

    //delete previous data
    database.query(`delete from teamsixn_scouting_dev.current_game_user_assignment;`, (err, results) => {
        consoleLog(err)
        //set new data
        consoleLog(`INSERT INTO teamsixn_scouting_dev.current_game_user_assignment
        (
                cgua_alliance, 
                cgua_alliance_position, 
                cgua_user_id
        )
        VALUES 
                ('R', 1, '` + body[0].id + `'),
                ('R', 2, '` + body[1].id + `'),
                ('R', 3, '` + body[2].id + `'),
                ('B', 1, '` + body[3].id + `'),
                ('B', 2, '` + body[4].id + `'),
                ('B', 3, '` + body[5].id + `');`)
        database.query(`INSERT INTO teamsixn_scouting_dev.current_game_user_assignment
        (
                cgua_alliance, 
                cgua_alliance_position, 
                cgua_user_id
        )
        VALUES 
                ('R', 1, '` + body[0].id + `'),
                ('R', 2, '` + body[1].id + `'),
                ('R', 3, '` + body[2].id + `'),
                ('B', 1, '` + body[3].id + `'),
                ('B', 2, '` + body[4].id + `'),
                ('B', 3, '` + body[5].id + `');`, (err, results) => {
                    consoleLog(err)
        })

        res.send("assigned users")
    })
})

module.exports = router