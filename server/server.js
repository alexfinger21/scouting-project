//MODULES
const http = require("http")
const express = require("express")
const path = require("path")
const app = express()
const ejs = require("ejs")

//DIRECTORIES
const serverDirectory = "./server"
const routeDirectory = "routers"

//ROUTERS

const login = require(path.resolve(serverDirectory, routeDirectory, "login.js"))

app.use("/static", express.static("./client/static"))

//sets variables to be used later
app.set("views", "./client/templates")
app.set("view engine", "ejs")

//adds json encoders and decoder libraries: middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//middleware for anyone on the site, checking whether they're logged in or ont
app.use((req, res, next) => { //if you don't provide a path, app.use will run before ANY request is processed
    //TO DO if logged in then render the first game page, otherwise redirect to login
    console.log(req.path != "/login")
    if (req.path != "/login" && req.path != "/data-collection") { //for testing purposes we include every page so it doesnt always redirect u to login
        res.redirect("/login")
    } else {
        next() //goes to the next middleware function (login or data collection)
    }
})

//LOGIN
app.use("/login", login) //it makes the app use the login router's get and post methods. its a replacement for get and post for the specific path

app.get("/data-collection", function(req, res) { //only gets used if the url == data-collection
    res.render("data-collection")
})

app.listen(3000) //goes to localhost 3000
