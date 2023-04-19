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
                    } e
                }
            } else {
                resolve({})
                return
            }

            let mapResult = body.map(e => e.direct_url)
            
            let index = mapResult.indexOf(undefined)

            while (index > -1) {
                mapResult.splice(index, 1)
                index = mapResult.indexOf(undefined)
            }
            
            resolve(mapResult)
        })
    })
}

getImageData().then()

module.exports = {getImageData}