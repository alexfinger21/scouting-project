require("dotenv").config()

const request = require("request")
const auth = process.env.TBA_AUTH
const gameConstants = require('./game.js') 
const { consoleLog } = require("./utility")

consoleLog(auth)

function imageRequest(team) {
    return {
        'method': 'GET',
        'url': `https://www.thebluealliance.com/api/v3/team/${"frc" + String(team)}/media/${gameConstants.YEAR}`,
        'headers': {
            'X-TBA-Auth-Key': auth,
            'If-Modified-Since': ''
        }
    }
}

consoleLog(imageRequest(695))

request(imageRequest(695), (err, response) => {
    let body = JSON.parse(response.body)

    for (const [key, img] of Object.entries(body)) {
        if (img.type == "youtube") {
            delete body[key]
        }
    }
    
    consoleLog(body)
})