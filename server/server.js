//MODULES
import https from "https"
import express from "express"
import path from "path"
import ejs from "ejs"
import cookieParser from "cookie-parser"
import cors from "cors"
import { consoleLog } from "./utility.js"
import fs from "fs"
import database from "./database/database.js"
import { returnAPIDATA } from "./getRanks.js"
import socketManager from "./sockets.js"
import SQL from "sql-template-strings"
import gameConstants from "./game.js"
import dotenv from "dotenv"
import { Server } from "socket.io"
import casdoorSdk from "./auth/auth.js"

//DIRECTORIES
const serverDirectory = "./server"
const routeDirectory = "routers"

//ROUTERS
const login = (await import(path.resolve(serverDirectory, routeDirectory, "login.js"))).default
const dataCollection = (await import(path.resolve(serverDirectory, routeDirectory, "data-collection.js"))).default
const teamSummary = (await import(path.resolve(serverDirectory, routeDirectory, "team-summary.js"))).default
const matchStrategy = (await import(path.resolve(serverDirectory, routeDirectory, "match-strategy.js"))).default
const allianceSelector = (await import(path.resolve(serverDirectory, routeDirectory, "alliance-selector.js"))).default
const matchListing = (await import(path.resolve(serverDirectory, routeDirectory, "match-listing.js"))).default
const matchVerify = (await import(path.resolve(serverDirectory, routeDirectory, "match-verify.js"))).default
const adminPage = (await import(path.resolve(serverDirectory, routeDirectory, "admin-page.js"))).default
const teamRankings = (await import(path.resolve(serverDirectory, routeDirectory, "rankings.js"))).default
const teamDetails = (await import(path.resolve(serverDirectory, routeDirectory, "team-details.js"))).default
const allianceInput = (await import(path.resolve(serverDirectory, routeDirectory, "alliance-input.js"))).default
const gameStrategy = (await import(path.resolve(serverDirectory, routeDirectory, "game-strategy.js"))).default
const pitScouting = (await import(path.resolve(serverDirectory, routeDirectory, "pit-scouting.js"))).default
const template = (await import(path.resolve(serverDirectory, routeDirectory, "template.js"))).default
const dataAccuracy = (await import(path.resolve(serverDirectory, routeDirectory, "data-accuracy.js"))).default
const apiRouter = (await import(path.resolve(serverDirectory, routeDirectory, "api.js"))).default
const appMatchesRouter = (await import(path.resolve(serverDirectory, routeDirectory, "app/matches.js"))).default
const appTasksRouter = (await import(path.resolve(serverDirectory, routeDirectory, "app/tasks.js"))).default

const app = express()
dotenv.config()

const credentials = {
    key: fs.readFileSync("./server/certs/privkey.pem"),
    cert: fs.readFileSync("./server/certs/fullchain.pem"),
}

const server = https.createServer(credentials, app)

//CONSTANTS
const corsOptions = {
    origin: '*',
    credentials: true
}

const allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type')

    next()
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
    const startTick = gameConstants.gameStart.getTime()
    const endTick = gameConstants.gameEnd.getTime()
    const currentTick = Date.now()
    consoleLog(startTick)
    consoleLog(currentTick)
    consoleLog(endTick)
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

app.use(allowCrossDomain)
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

app.use(async (req, res, next) => { 
    if (req.path.substring(0, 4) == "/api") {
        return next()
    }

    if (!req.cookies.u_token && req.path != "/login") { //for testing purposes we include every page so it doesnt always redirect u to login
        res.redirect("/login")
    } else if (req.path != "/login") {
        const user = casdoorSdk.parseJwtToken(req.cookies.u_token)

        if (user) {
            const userAgent = req.headers["user-agent"] || ""
            res.locals.isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent) //pass in if mobile browser to ejsres
            //res.locals.authUserId = result.um_id
            //local EJS functions
            res.locals.columnSummary = (...args) => {
                let t = fs.readFileSync("./client/templates/columnSummary.ejs", "utf-8")
                return ejs.render(t, ...args)
            }
            next() //goes to the next middleware function (login or data collection)
        } else {
            return res.json({"logout": true})
        }
    } else {
        consoleLog("next")
        next()
    }
})

//error handler
app.use((err, req, res, next) => {
  console.error(err.stack)

  const statusCode = err.status || 500

  res.status(statusCode).json({
    status: "error",
    statusCode: statusCode,
    message: err.message || "Internal Server Error"
  })
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

//API
app.use("/api", apiRouter)

//APP MATCHES ENDPOINT
app.use("/app-matches", appMatchesRouter)


//APP TASKS ENDPOINT
app.use("/app-tasks", appTasksRouter)


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
app.listen(3000, "0.0.0.0", (error) => {
    if (error) {
        throw new Error("Can't connect to port 3000")
    }

    console.log("Listening on port 3000")
}) //goes to localhost 3000

server.listen(5000, { pingTimeout: 60000, pingInterval: 15000 })

;(async function firstCall() {
    const apiRes = await runAPICall()
    consoleLog("RUNNING API CALL", apiRes)
})()
