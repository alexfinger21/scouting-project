require("dotenv").config()

const request = require("request")
const auth = process.env.TBA_AUTH
const gameConstants = require('./game.js')
const { consoleLog } = require("./utility")
const { map } = require("jquery")

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

function getImageData(filter = "image", team) {
    return new Promise(resolve => {
        request(imageRequest(team), (err, response) => {
            let body = JSON.parse(response.body)
            consoleLog(body)

            if (!body.Error) {
                for (const [key, img] of Object.entries(body)) {
                    if (Object.keys(img.details).length > 0 || img.type != "imgur") {
                        delete body[key]
                    } else if (img.type == "youtube" && filter == "image") {
                        delete body[key]
                    } else if (img.type == "imgur" && filter == "video") {
                        delete body[key]
                    }
                }
            } else {
                resolve({})
                return
            }

            const mapResult = body.map(e => e.direct_url)
            
            resolve(mapResult)
        })
    })
}

module.exports = {getImageData}