
require("dotenv").config()

const request = require("request")
const auth = process.env.FIRST_AUTH
const authbase64 = Buffer.from(auth, 'utf8').toString('base64')
const database = require("./database/database.js")
const gameConstants = require('./game.js') 

const options = {
    'method': 'GET',
    'url': 'https://frc-api.firstinspires.org/v3.0/' + gameConstants.YEAR + '/rankings/'+gameConstants.COMP,
    'headers': {
        'Authorization': 'Basic ' + authbase64,
        'If-Modified-Since': ''
    }
}

console.log(options)

function printMessage(title, msg) {
    console.log("------ " + title + " ------")
    console.log(msg)
    console.log("------End Message------")
}

printMessage('Base64', authbase64)
// printMessage('Options', options)

let showObj = function () {
    console.log("Shape")
    console.log(teamData.headers)
    for (let prop in teamData) {
        console.log(1)
        console.log(prop)
        //   console.log(prop)
        //   console.log(teamData[prop])
    }
}

function returnAPIDATA() {
    return new Promise(resolve => {
        request(options, function (error, response) {
            if (error) throw new Error(error)
            printMessage("Status Code", response.statusCode)
            const teamData = JSON.parse(response.body)

            //printMessage('Type of Data', typeof teamData)
            // teamData.teams.forEach((team) => {
            //   printMessage('Team Info', team)
            // }
            // showObj()
            // printMessage('Length of Teams array', team_data.teams.teamNumber)
            //printMessage('Data', teamData)
            //console.log(teamData.Rankings[0].teamNumber)



            let team_stats = []

            for (let i = 0; i < teamData.Rankings.length; i++) {
                let rank_str = String(teamData.Rankings[i].rank)
                let team_num_str = String(teamData.Rankings[i].teamNumber)
                let wins_str = String(teamData.Rankings[i].wins)
                let losses_str = String(teamData.Rankings[i].losses)
                let ties_str = String(teamData.Rankings[i].ties)
                let matches_played_str = String(teamData.Rankings[i].matchesPlayed)
                let a = "(" + rank_str + "," + team_num_str + "," + wins_str + "," + losses_str + "," + ties_str + "," + matches_played_str + ")"
                team_stats.push(a)
            }

            printMessage('Data', team_stats)
            console.log(database.deleteAPIData())
            database.query(database.deleteAPIData(), (err, res) => {
                console.log(err)
                console.log(res)
                database.query(database.writeAPIData(teamData.Rankings), (err, res) => {
                    console.log(err)
                    console.log(res)
                })
            })

            

            resolve(teamData)
        })
    })
}

/*
returnAPIDATA().then(res => {
    console.log(res.Rankings.map(e => e.rank))
})*/

module.exports = {returnAPIDATA}