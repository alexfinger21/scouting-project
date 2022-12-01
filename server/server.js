//MODULES
const http = require("http")
const express = require("express")
const path = require("path")
const app = express()
const ejs = require("ejs")
const cookieParser = require('cookie-parser')
//DIRECTORIES
const serverDirectory = "./server"
const routeDirectory = "routers"

//ROUTERS

const login = require(path.resolve(serverDirectory, routeDirectory, "login.js"))

//CONSTS
const user = { //TEST USER
    assignedTeam: 695,
    teamColor: "red"
}

app.use("/static", express.static("./client/static"))

//sets variables to be used later
app.set("views", "./client/templates")
app.set("view engine", "ejs")

//adds json encoders and decoder libraries: middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())
//middleware for anyone on the site, checking whether they're logged in or ont
app.use((req, res, next) => { //if you don't provide a path, app.use will run before ANY request is processed
    if (!req.cookies["user_id"] && req.path != "/login") { //for testing purposes we include every page so it doesnt always redirect u to login
        res.redirect("/login")
    } else {
        next() //goes to the next middleware function (login or data collection)
    }
})

//DEFAULT PATH
app.get("/", function(req, res) { //only gets used if the url == /
   res.redirect("data-collection")
})

//LOGIN
app.use("/login", login) //it makes the app use the login router's get and post methods. its a replacement for get and post for the specific path

//DATA COLLECTION
app.get("/data-collection", function(req, res) { //only gets used if the url == data-collection
    console.log("hi")
    res.render("data-collection", {
        user
    })
})

//PORT
app.listen(3000) //goes to localhost 3000
