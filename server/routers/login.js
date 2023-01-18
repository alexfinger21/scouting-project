const user = require("../user")
const express = require("express")
const router = express.Router()
const crypto = require("crypto")

router.get("/", function(req, res) {
    if (!req.cookies["user_id"]) {//if user hasn't logged in before
        const login_data = req.query.error ? req.query.error : "invisible"

        console.log(login_data)

        res.render("login", {user: user, error: login_data})
    } else { //if user has logged in before
        res.redirect("/")
    }
})

router.post("/", function(req, res) {
    //TO DO - SQL QUERY TO RETRIEVE THE USER
    const body = req.body
    console.log(body)
    console.log(req.cookies)

    if (body.username == user.username) {
        if (body.password == user.password) {
            if (body.team_number == user.team_number) {
                //successful login
                res.cookie("user_id", crypto.randomBytes(32).toString, {
                    maxAge: 24 * 60 * 60 * 1000,
                    // expires works the same as the maxAge
                    httpOnly: true,
                });

                console.log("success for " + body.username)
                return res.status(200).send({result: 'redirect', url:'/app'})
            }
        }
    }
     //wrong info
    return res.status(200).send({result: 'redirect', url:'/login?error=visible'})
})

module.exports = router