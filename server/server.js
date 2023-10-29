//MODULES
const https = require("https")
const express = require("express")
const path = require("path")
const app = express()
const ejs = require("ejs")
const cookieParser = require('cookie-parser')
const cors = require("cors")
const mysql = require("mysql")
const { consoleLog } = require("./utility")
const fs = require("fs")
const crypto = require("crypto")
require("dotenv").config()
const database = require("./database/database.js")
const {gameStart, gameEnd} = require("./game.js")
const { returnAPIDATA } = require("./getRanks")
const gameConstants = require("./game.js")

const socketManager = require("./sockets.js")
const { Server } = require("socket.io")
const credentials = {
    key: fs.readFileSync("./server/certs/privkey.pem"),
    cert: fs.readFileSync("./server/certs/fullchain.pem"),
}

const server = https.createServer(credentials, app)

//DIRECTORIES
const serverDirectory = "./server"
const routeDirectory = "routers"

//ROUTERS

const login = require(path.resolve(serverDirectory, routeDirectory, "login.js"))
const dataCollection = require(path.resolve(serverDirectory, routeDirectory, "data-collection.js"))
const teamSummary = require(path.resolve(serverDirectory, routeDirectory, "team-summary.js"))
const matchStrategy = require(path.resolve(serverDirectory, routeDirectory, "match-strategy.js"))
const allianceSelector = require(path.resolve(serverDirectory, routeDirectory, "alliance-selector.js"))
const matchListing = require(path.resolve(serverDirectory, routeDirectory, "match-listing.js"))
const adminPage = require(path.resolve(serverDirectory, routeDirectory, "admin-page.js"))
const teamRankings = require(path.resolve(serverDirectory, routeDirectory, "rankings.js"))
const teamDetails = require(path.resolve(serverDirectory, routeDirectory, "team-details.js"))
const allianceInput = require(path.resolve(serverDirectory, routeDirectory, "alliance-input.js"))

//CONSTANTS

const corsOptions = {
    origin: '*',
    credentials: true 
}

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    next();
}


//sockets, they let us connect users and the server based on events
const io = new Server(server, {
    cors: {
        origin: '*',
    }
})

//FUNCTIONS
async function runAPICall() {
    const startTick = gameStart.getTime()
    const endTick = gameEnd.getTime()
    const currentTick = Date.now()
    consoleLog(currentTick)
    consoleLog(startTick) 
    if (startTick <= currentTick && currentTick <=endTick) {
        const apiData = await returnAPIDATA()
        consoleLog(apiData)
    }
}

io.on("connection", (socket) => {
    const index = socketManager.addSocket(socket)
    
    socket.on("disconnect", () => {
        socketManager.removeSocket(index)
        consoleLog(socketManager.getSockets())
    })
    
    consoleLog(socketManager.getSockets())
})

app.use("/static", express.static("./client/static"))

app.use(allowCrossDomain);
//sets variables to be used later
app.set("views", "./client/templates")
app.set("view engine", "ejs")
app.use('/favicon.ico', express.static('images/favicon.ico'))
//adds json encoders and decoder libraries: middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors(corsOptions))

app.use(cookieParser())


//middleware for anyone on the site, checking whether they're logged in or not

app.use((req, res, next) => { //if you don't provide a path, app.use will run before ANY request is processed
    consoleLog(req.path)
    if (!req.cookies["user_id"] && req.path != "/login") { //for testing purposes we include every page so it doesnt always redirect u to login
        res.redirect("/login")
    } else if (req.path != "/login") {
        consoleLog(req.path)
        const user_id = req.cookies["user_id"]
        const username = req.cookies["username"]
        database.query("SELECT um.um_timeout_ts FROM user_master um WHERE um.um_session_id = '" + user_id + "' AND um.um_id = '" + username + "' AND um.um_timeout_ts > current_timestamp();", (err, results) => {
            consoleLog(err)
            if (results) {
                const result = results[0]
                next() //goes to the next middleware function (login or data collection)
            } else {
                res.clearCookie('user_id');
                res.clearCookie('username');
                consoleLog("redirect")
                res.redirect("/login")
            }
        })
    } else {
        consoleLog("next")
        next()
    }
})

//DEFAULT PATH
app.get("/", function(req, res) { //only gets used if the url == /
   res.redirect("app")
})

//MAIN
app.use("/app", dataCollection)

//LOGIN
app.use("/login", login) //it makes the app use the login router's get and post methods. its a replacement for get and post for the specific path

//DATA COLLECTION
app.use("/data-collection", dataCollection)

//TEAM SUMMARY
app.use("/team-summary", teamSummary)

//MATCH-STRATEGY
app.use("/match-strategy", matchStrategy)

//ALLIANCE SELECTOR
app.use("/alliance-selector", allianceSelector)

//MATCH LISTING
app.use("/match-listing", matchListing)

//ADMIN PAGE
app.use("/admin-page", adminPage)

//TEAM RANKINGS
app.use("/rankings", teamRankings)

//TEAM DETAILS
app.use("/team-details", teamDetails)

//ALLIANCE INPUT
app.use("/alliance-input", allianceInput)

//GET MATCH
app.get("/getMatch", function(req, res) {
    consoleLog(req.body)
    database.query(`select * from teamsixn_scouting_dev.current_game;`, (err, runningMatchResults) => {
        if(runningMatchResults[0]) { //if a match is running
            runningMatch = runningMatchResults[0].cg_gm_number
            res.status(200).send({match: runningMatch})
        } else {
            res.status(200).send({match: 0})
        }
    })
})

app.get("/getMatchTeams", function(req, res) {
    consoleLog("request recieved!")
    database.query(database.getTeams(), (err, runningMatchResults) => {
        //consoleLog(JSON.parse(JSON.stringify(runningMatchResults)))
        res.status(200).send(JSON.parse(JSON.stringify(runningMatchResults)))
    })
})

if (gameConstants.COMP != "test" && gameConstants.GAME_TYPE != "P") {
    setInterval(runAPICall, 100000)
}
//PORT
app.listen(3000) //goes to localhost 3000

server.listen(5000, {pingTimeout : 60000, pingInterval : 15000})