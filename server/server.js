const http = require("http")
const express = require("express")
const path = require("path")
const app = express()
const ejs = require("ejs")
//app.set("view engine", "ejs")

app.use('/static', express.static("./client/static"));


app.engine('html', ejs.renderFile);

app.set("views", "./client")
app.set('view engine', 'html');

app.get("/", function(req, res) {
    res.render("login")
})

app.listen(3000)
