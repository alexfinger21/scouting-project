//MODULES
import https from "https"
import http from "http"
import express from "express"
import path from "path"
import { pathToFileURL } from "url"
import ejs from "ejs"
import cookieParser from "cookie-parser"
import cors from "cors"
import { consoleLog } from "./utility.js"
import fs from "fs"
import { syncServer } from "./getRanks.js"
import socketManager from "./sockets.js"
import gameConstants from "./game.js"
import dotenv from "dotenv"
import { Server } from "socket.io"
import casdoorSdk from "./auth/auth.js"

dotenv.config()

//DIRECTORIES
const serverDirectory = "./server"
const routeDirectory = "routers"
const useDevServerCompat = process.env.SERVER_DEV_MODE === "1"

function importRouter(relativePath) {
    const resolvedPath = path.resolve(
        serverDirectory,
        routeDirectory,
        relativePath
    )

    return import(pathToFileURL(resolvedPath).href)
}

// function importRouter(relativePath) {
//     const resolvedPath = path.resolve(serverDirectory, routeDirectory, relativePath)
//     return useDevServerCompat
//         ? import(pathToFileURL(resolvedPath).href)
//         : import(resolvedPath)
// }

//ROUTERS
const login = (await importRouter("login.js")).default
const dataCollection = (await importRouter("data-collection.js")).default
const teamSummary = (await importRouter("team-summary.js")).default
const matchStrategy = (await importRouter("match-strategy.js")).default
const allianceSelector = (await importRouter("alliance-selector.js")).default
const matchListing = (await importRouter("match-listing.js")).default
const matchVerify = (await importRouter("match-verify.js")).default
const adminPage = (await importRouter("admin-page.js")).default
const teamRankings = (await importRouter("rankings.js")).default
const teamDetails = (await importRouter("team-details.js")).default
const allianceInput = (await importRouter("alliance-input.js")).default
const gameStrategy = (await importRouter("game-strategy.js")).default
const pitScouting = (await importRouter("pit-scouting.js")).default
const template = (await importRouter("template.js")).default
const dataAccuracy = (await importRouter("data-accuracy.js")).default
const apiRouter = (await importRouter("api.js")).default
const appMatchesRouter = (await importRouter("app/matches.js")).default
const appTasksRouter = (await importRouter("app/tasks.js")).default

const app = express()

const privKeyPath = "./server/certs/privkey.pem"
const fullChainPath = "./server/certs/fullchain.pem"
const hasHttpsCerts = fs.existsSync(privKeyPath) && fs.existsSync(fullChainPath)

if (!useDevServerCompat && !hasHttpsCerts) {
    throw new Error("TLS certs are required unless SERVER_DEV_MODE=true.")
}

const useHttpsSocketServer = !useDevServerCompat
    ? true
    : process.env.SOCKET_USE_HTTPS === "1" && hasHttpsCerts

const credentials = useHttpsSocketServer
    ? {
        key: fs.readFileSync(privKeyPath),
        cert: fs.readFileSync(fullChainPath),
    }
    : null

console.log("USING dev server format", useDevServerCompat)

const server = useHttpsSocketServer
    ? https.createServer(credentials, app)
    : http.createServer(app)

if (useDevServerCompat) {
    if (useHttpsSocketServer) {
        console.warn(
            "SERVER_DEV_MODE=true and SOCKET_USE_HTTPS=true; Socket.IO server on port 5000 is using HTTPS."
        )
    } else {
        console.warn(
            "SERVER_DEV_MODE=true; Socket.IO server on port 5000 is using HTTP for local testing."
        )
    }
}

//CONSTANTS
const corsOptions = {
    origin: '*',
    credentials: true
}

const allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')

    res.header(
        'Access-Control-Allow-Methods',
        'GET,PUT,POST,DELETE'
    )

    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type'
    )

    next()
}


//sockets, they let us connect users and the server based on events
const io = new Server(
    server, 
    {
        cors: {
            origin: '*',
            credentials: true
        },
        pingTimeout: 7200000,
        pingInterval: 25000
    }
)

//FUNCTIONS
async function runApiCall() {
    const startTick = gameConstants.gameStart.getTime()
    const endTick = gameConstants.gameEnd.getTime()
    const currentTick = Date.now()

    if (startTick <= currentTick && currentTick <= endTick) {
        const apiData = await syncServer()

        return apiData
    } else {
        return {"error": "game time is out of date"}
    }
}

io.on("connection", (socket) => {
    const socketObj = socketManager.socketArray[
        socketManager.addSocket(socket)
    ]

    socket.on("username", (data) => {
      socketObj.username = data.name
    })

    socket.on("disconnect", (reason) => {
        const res = socketManager.removeSocket(socketObj)
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
    consoleLog(req.path)

    if (req.path.substring(0, 4) == "/api") {
        return next()
    }

    if (!req.cookies.u_token && req.path != "/login") { 
        res.redirect("/login")
    } else if (req.path != "/login") {
        const user = casdoorSdk.parseJwtToken(req.cookies.u_token)

        if (user) {
            const userAgent = req.headers["user-agent"] || ""

            //pass in if mobile browser to ejsres
            res.locals.isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent) 

            //local EJS functions
            res.locals.columnSummary = (...args) => {
                let t = fs.readFileSync(
                    "./client/templates/columnSummary.ejs",
                    "utf-8"
                )

                return ejs.render(t, ...args)
            }

            next() 
        } else {
            return res.json({"logout": true})
        }
    } else {
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
app.use("/login", login) 

//DATA COLLECTION
app.use("/data-collection", dataCollection)
/******* */

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
        return next()
    }

    res.status(404)

    res.redirect("/app")
})

if (gameConstants.COMP != "test" && gameConstants.GAME_TYPE != "P") {
    setInterval(runApiCall, 120*1000)
}

// PORT
app.listen(3000, "0.0.0.0", (error) => {
    if (error) {
        throw new Error("Can't connect to port 3000")
    }

    console.log("Listening on port 3000")
})


// SOCKET 
server.listen(5000, { pingTimeout: 60000, pingInterval: 15000 })

(async function firstCall() {
    const apiRes = await runApiCall()

    consoleLog("RUNNING API CALL", apiRes)
})()
