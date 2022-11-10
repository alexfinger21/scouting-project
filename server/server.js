const http = require("http")
const express = require("express")
const path = require("path")
const app = express()
const ejs = require("ejs")
//app.set("view engine", "ejs")

app.use("/static", express.static("./client/static"));

app.set("views", "./client/templates")
app.set("view engine", "ejs");

app.get("/", function(req, res) {
    res.render("login")
})

app.listen(3000)
