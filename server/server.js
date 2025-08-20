//MODULES
const https = require("https")
const express = require("express")
const path = require("path")
const app = express()
const ejs = require("ejs")
const cookieParser = require('cookie-parser')
const cors = require("cors")
const { consoleLog } = require("./utility")
const fs = require("fs")
require("dotenv").config()
const database = require("./database/database.js")
const { gameStart, gameEnd } = require("./game.js")
const { returnAPIDATA } = require("./getRanks.js")
const socketManager = require("./sockets.js")
const SQL = require('sql-template-strings')
const gameConstants = require("./game.js")

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
const matchVerify = require(path.resolve(serverDirectory, routeDirectory, "match-verify.js"))
const adminPage = require(path.resolve(serverDirectory, routeDirectory, "admin-page.js"))
const teamRankings = require(path.resolve(serverDirectory, routeDirectory, "rankings.js"))
const teamDetails = require(path.resolve(serverDirectory, routeDirectory, "team-details.js"))
const allianceInput = require(path.resolve(serverDirectory, routeDirectory, "alliance-input.js"))
const gameStrategy = require(path.resolve(serverDirectory, routeDirectory, "game-strategy.js"))
const pitScouting = require(path.resolve(serverDirectory, routeDirectory, "pit-scouting.js"))
const template = require(path.resolve(serverDirectory, routeDirectory, "template.js"))
const dataAccuracy = require(path.resolve(serverDirectory, routeDirectory, "data-accuracy.js"))
const apiRouter = require(path.resolve(serverDirectory, routeDirectory, "api.js"))

//CONSTANTS
const corsOptions = {
    origin: '*',
    credentials: true
}

const allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}


//sockets, they let us connect users and the server based on events
const io = new Server(server, {
    cors: {
        origin: '*',
        credentials: true
    },
    pingTimeout: 7200000,
    pingInterval: 25000
})

//FUNCTIONS
async function runAPICall() {
    const startTick = gameStart.getTime()
    const endTick = gameEnd.getTime()
    const currentTick = Date.now()
    consoleLog(currentTick)
    consoleLog(startTick)
    if (startTick <= currentTick && currentTick <= endTick) {
        const apiData = await returnAPIDATA()
        return apiData
    } else {
        return {"error": "game time is out of date"}
    }
}

io.on("connection", (socket) => {
    const socketObj = socketManager.socketArray[socketManager.addSocket(socket)]

    socket.on("username", (data) => {
      socketObj.username = data.name
    })

    socket.on("disconnect", (reason) => {
        consoleLog(`SOCKET ${socket?.username} DISCONNECTED: ` + reason)
        const res = socketManager.removeSocket(socketObj)
        consoleLog("SOCKET DELETE RES: " + String(res), socketManager.getSockets())
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

app.use(async (req, res, next) => { //if you don't provide a path, app.use will run before ANY request is processed
    consoleLog(req.path)
    if (!req.cookies["user_id"] && req.path != "/login") { //for testing purposes we include every page so it doesnt always redirect u to login
        res.redirect("/login")
    } else if (req.path != "/login") {
        consoleLog(req.path)
        const username = req.cookies["username"]
        const [err, results] = await database.query(SQL`SELECT * FROM user_master um WHERE um.um_id = ${username} AND um.um_timeout_ts > current_timestamp();`)
        
        if (err) {
            consoleLog("LOGIN ERROR: " + err)
        }
        
        const result = JSON.parse(JSON.stringify(results))[0]
        let splitResult = result?.um_session_id ? result?.um_session_id.split(",") : new Array()
        if (splitResult.length == 0) {
            splitResult = [result?.um_session_id]
        }
        if (splitResult.indexOf(req.cookies["user_id"]) != -1) {
            const userAgent = req.headers["user-agent"] || ""
            res.locals.isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent) //pass in if mobile browser to EJS

//local EJS functions
res.locals.columnSummary = (...args) => {
    let t = fs.readFileSync("./client/templates/columnSummary.ejs", "utf-8")
    return ejs.render(t, ...args)
}
            next() //goes to the next middleware function (login or data collection)
        } else {
            res.clearCookie('user_id');
            res.clearCookie('username');
            consoleLog("session timeout")
            return res.json({"logout": true})
        }
    } else {
        consoleLog("next")
        next()
    }
})

//MAIN
app.use("/app", template)

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

//MATCH VERIFY
app.use("/match-verify", matchVerify)

//ADMIN PAGE
app.use("/admin-page", adminPage)

//TEAM RANKINGS
app.use("/rankings", teamRankings)

//TEAM DETAILS
app.use("/team-details", teamDetails)

//ALLIANCE INPUT
app.use("/alliance-input", allianceInput)

app.use("/game-strategy", gameStrategy)

//PIT SCOUTING PAGE
app.use("/pit-scout", pitScouting)

//DATA ACCURACY PAGE
app.use("/data-accuracy", dataAccuracy)

//LOGOUT
app.post("/logout", (req, res) => {
   res.cookie("user_id", "", {
            maxAge: 24 * 60 * 60 * 1000,
            // expires works the same as the maxAge
            httpOnly: true,
        }   
   )

    return res.redirect("/login")
})

app.use("/api", apiRouter)

//DEFAULT PATH
app.use((req, res, next) => {
    //pit-scouting
    if (req.path.match(/(pit-scouting)+/) != null) {
        consoleLog("here")
        return next()
    }

    res.status(404)

    res.redirect("/app")
})

if (gameConstants.COMP != "test" && gameConstants.GAME_TYPE != "P") {
    setInterval(runAPICall, 240000)
}

//PORT
app.listen(3000) //goes to localhost 3000

server.listen(5000, { pingTimeout: 60000, pingInterval: 15000 })

;(async function firstCall() {
    const apiRes = await runAPICall()
    consoleLog("RUNNING API CALL", apiRes)
})()
