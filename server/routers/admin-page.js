const user = require("../user")
const express = require("express")
const database = require("../database/database")
const router = express.Router()

router.get("/", async function (req, res) {
    database.query(`select 
    um.um_id ,
    concat(um.um_name," - ", um.um_id) as admin_display
    from 
    teamsixn_scouting_dev.user_master um`, async (err, teamMembers) => { //get all team members
        teamMembers = JSON.parse(JSON.stringify(teamMembers)) //convert rowDataPacket to object
        console.log(err)
        console.log(teamMembers)

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
        cgua_alliance, 
        cgua_alliance_position ;`, async (err, assignedUsers) => { //get currently assigned users
            console.log(err)
            console.log("assigned users::")
            console.log(assignedUsers)
            let assignedUsers = JSON.parse(JSON.stringify(assignedUsers)) //turn rowDataPacket into an object

            console.log(assignedUsers)

            res.render("admin-page", {
                team: teamMembers,
                assignedUsers: assignedUsers
            })
        })
    })
})

router.post("/", function (req, res) { //admin presses save button
    const body = req.body //users and their assigned team\
    console.log("body:")
    console.log(body)

    //delete previous data
    database.query(`delete from teamsixn_scouting_dev.current_game_user_assignment;`, (err, results) => {
        console.log(err)
        //set new data
        console.log(`insert into teamsixn_scouting_dev.current_game_user_assignment 
        (cg_r1_user_id, cg_r2_user_id, cg_r3_user_id, cg_b1_user_id, cg_b2_user_id, cg_b3_user_id)
        values ('` + body[0] + "','" + body[1] + "','" + body[2] + "','" + body[3] + "','" + body[4] + "','" + body[5] + "');")
        database.query(`insert into teamsixn_scouting_dev.current_game_user_assignment 
                (cg_r1_user_id, cg_r2_user_id, cg_r3_user_id, cg_b1_user_id, cg_b2_user_id, cg_b3_user_id)
                values ('` + body[0] + "','" + body[1] + "','" + body[2] + "','" + body[3] + "','" + body[4] + "','" + body[5] + "');", (err, results) => {
            console.log("asssigned")
            console.log(err)
        })

        res.send("assigned users")
    })
})

module.exports = router