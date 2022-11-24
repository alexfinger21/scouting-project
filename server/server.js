const http = require("http")
const express = require("express")
const path = require("path")
const app = express()
const ejs = require("ejs")
//app.set("view engine", "ejs")

app.use("/static", express.static("./client/static"));

app.set("views", "./client/templates")
app.set("view engine", "ejs");

//middleware for anyone on the site, checking whether they're logged in or ont
app.use((req, res, next) => {
    //TO DO if logged in then render the first game page, otherwise redirect to login
    console.log(req.path != "/login")
    if (req.path != "/login") {
        res.redirect("/login")
    } else {
        next()
    }
})

app.get("/login", function(req, res) {
    res.render("login")
})

app.listen(3000)
