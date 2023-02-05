const user = require("../user")
const express = require("express")
const database = require("../database/database")
const router = express.Router()

router.get("/", async function (req, res) {
    database.query(` SELECT um_id, um_name FROM user_master`, async (err, teamMembers) => { //get all team members
        teamMembers = JSON.parse(JSON.stringify(teamMembers)) //convert rowDataPacket to object
        console.log(err)
        console.log(teamMembers)

        database.query(` SELECT cgua_user_id FROM teamsixn_scouting_dev.current_game_user_assignment`, async (err, assignedUsers) => { //get currently assigned users
            console.log(err)
            assignedUsers = Object.values(JSON.parse(JSON.stringify(assignedUsers))[0]) //turn rowDataPacket into an object
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