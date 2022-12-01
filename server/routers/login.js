const express = require("express")
const router = express.Router()

const testUser = {
    team_number: 695,
    username: "alex", 
    password: "npc"
}

router.get("/", function(req, res) {

    const login_data = req.query.info ? req.query.info : {}

    res.render("login", login_data)
})

router.post("/", function(req, res) {
    //TO DO - SQL QUERY TO RETRIEVE THE USER
    const body = req.body
    console.log(body)

    if (body.username == testUser.username) {
        if (body.password == testUser.password) {
            if (body.team_number == testUser.team_number) {
                //successful login
                console.log("success for " + body.username)
                return res.status(200).send({result: 'redirect', url:'/data-collection'})
            }
        }
    }
     //wrong info
    return res.status(200).send({result: 'redirect', url:'/login?error=visible'})
})

module.exports = router