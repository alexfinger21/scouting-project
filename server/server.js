//MODULES
const http = require("http")
const express = require("express")
const path = require("path")
const app = express()
const ejs = require("ejs")
const cookieParser = require('cookie-parser')
const cors = require("cors")
const mysql = require("mysql")
const crypto = require("crypto")
require('dotenv').config()

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

//CONSTANTS
const user = { //TEST USER
    team_number: 695,
    username: "alex",
    password: "npc",
    admin: true,
}

const algorithm = "aes-256-cbc"
const initVector = crypto.randomBytes(16)
const securitykey = crypto.randomBytes(32)
const cipher = crypto.createCipheriv(algorithm, securitykey, initVector);

console.log(securitykey + "\n" + initVector)

const corsOptions = {
    origin: '*',
    credentials: true 
};

//CONNECT MYSQL

console.log(process.env.DB_PASS)

const connection = mysql.createConnection({
    host     : process.env.DATABASE_HOST,
    database : process.env.DATABASE,
    user     : process.env.USER,
    password : process.env.DB_PASS,
});

//SELECT * FROM user_master um WHERE um.um_id = AND team_master_tm_number = ;

connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }

    console.log('Connected as id ' + connection.threadId);
});

// connection.query("SELECT * FROM user_master um WHERE um.um_id = AND team_master_tm_number = ;", function (error, results, fields) {
//     if (error)
//         throw error;

//     console.log(results)
// });


//connection.end();

app.use("/static", express.static("./client/static"))

//sets variables to be used later
app.set("views", "./client/templates")
app.set("view engine", "ejs")

//adds json encoders and decoder libraries: middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors(corsOptions))

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

//PORT
app.listen(3000) //goes to localhost 3000