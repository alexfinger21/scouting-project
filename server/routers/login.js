const express = require("express")
const router = express.Router()
const crypto = require("crypto")

const testUser = {
    team_number: 695,
    username: "alex", 
    password: "npc"
}

router.get("/", function(req, res) {

    if (!req.cookies["user_id"]) {//if user hasn't logged in before
        const login_data = req.query.error ? req.query.error : "invisible"

        console.log(login_data)

        res.render("login", {error: login_data})
    } else { //if user has logged in before
        res.redirect("/")
    }
})

router.post("/", function(req, res) {
    //TO DO - SQL QUERY TO RETRIEVE THE USER
    const body = req.body
    console.log(body)

    if (body.username == testUser.username) {
        if (body.password == testUser.password) {
            if (body.team_number == testUser.team_number) {
                //successful login
                res.cookie("user_id", crypto.randomBytes(32).toString, {
                    maxAge: 86400 * 1000,
                    // expires works the same as the maxAge
                    secure: true,
                    httpOnly: true,
                    sameSite: 'lax'
                });

                console.log("success for " + body.username)
                return res.status(200).send({result: 'redirect', url:'/data-collection'})
            }
        }
    }
     //wrong info
    return res.status(200).send({result: 'redirect', url:'/login?error=visible'})
})

module.exports = router