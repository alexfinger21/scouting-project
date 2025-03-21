const log = true
const debugLog = false //shows where console logs came from
const canvasFPS = 50
let reqId = 0

let currentPage = "/match-listing"

const paths = {
    dataCollection: "/data-collection",
    login: "/login",
    matchListing: "/match-listing",
    matchStrategy: "/match-strategy",
    adminPage: "/admin-page",
    matchVerify: "/match-verify",
    teamSummary: "/team-summary",
    teamDetails: "/team-details",
    allianceInput: "/alliance-input",
    allianceSelector: "/alliance-selector",
    rankings: "/rankings",
    pitScouting: "/pit-scout",
    logout: "/logout",
    dataAccuracy: "/data-accuracy"
    //eventData: "/event-data"
}

function consoleLog(...args) {
    if (log) {
        console.log(...args)
        if(debugLog) {
            console.trace()
        }
    }
}

function waitForElem(query) {
    return new Promise((res, rej) => {
        consoleLog(query)
        const ogQuery = document.querySelector(query) 
        if (ogQuery) {
            return res(ogQuery)
        }
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (!mutation.addedNodes) {continue;}

                const queryRes = document.querySelector(query) 
                if (queryRes) {
                    observer.disconnect()
                    return res(queryRes)
                }
            }
        })
    })
}

function hexToRgb(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

function lerp(a, b, c) {
    return a + (b-a) * c
}

const highlightColors = {
    695: "rgb(255,217,98)",
    2399: "rgb(255,189,241)"
}

const socket = io.connect(`${window.location.hostname}:5000`, {
    forceNew: true,
    transports: ["polling"],
})


const clamp = (num, min, max) => Math.min(Math.max(min, num), max)


function getColors(color) {
    color = color.substring(4, color.length).split(", ")
    color[2] = color[2].substring(0, color[2].length - 1)

    return color.map(e => Number(e))
}

function lerpColor(current, goal, tickDiff, changePerS) {
    const [c1, c2, c3] = getColors(current)
    const [g1, g2, g3] = getColors(goal)

    const l = Math.min(1, tickDiff/1000*changePerS)

    return `rgb(${lerp(c1, g1, isNaN(l) ? 0 : l)}, ${lerp(c2, g2, isNaN(l) ? 0 : l)}, ${lerp(c3, g3, isNaN(l) ? 0 : l)})`
}

function lerpOpacity(current, goal, tickDiff, changePerS) {
    const i = Math.min(1, tickDiff/1000*changePerS)
    return lerp(current, goal, isNaN(i) ? 0: i)
}

//decides whether point (x,y) is inside a triangle with vertices (x1,y1), (x2,y2), and (x3,y3)
function insideTriangle(x1,y1,x2,y2,x3,y3,x,y) {
    const x_coeff_1 = y2-y1
    const y_coeff_1 = x1-x2
    const const_1 = (y2-y1)*(-x1)+(x2-x1)*(y1)
    const is_pos11 = (x_coeff_1 * x3 + y_coeff_1 * y3 + const_1 >= 0)
    const is_pos1p = (x_coeff_1 * x + y_coeff_1 * y + const_1 >= 0)

    const x_coeff_2 = y3-y2
    const y_coeff_2 = x2-x3
    const const_2 = (y3-y2)*(-x2)+(x3-x2)*(y2)
    const is_pos21 = (x_coeff_2 * x1 + y_coeff_2 * y1 + const_2 >= 0)
    const is_pos2p = (x_coeff_2 * x + y_coeff_2 * y + const_2 >= 0)

    const x_coeff_3 = y1-y3
    const y_coeff_3 = x3-x1
    const const_3 = (y1-y3)*(-x3)+(x1-x3)*(y3)
    const is_pos31 = (x_coeff_3 * x2 + y_coeff_3 * y2 + const_3 >= 0)
    const is_pos3p = (x_coeff_3 * x + y_coeff_3 * y + const_3 >= 0)

    return is_pos11 == is_pos1p && is_pos21 == is_pos2p && is_pos31 == is_pos3p
}


//selects a random value from an array
function getMatch() {
    return new Promise((resolve) => {
        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: "/getMatch",
            success: function (response) {
                consoleLog(response.match)
                resolve(response.match)
            },

            error: function (jqXHR, textStatus, errorThrown) {
                //consoleLog("Error\n" + errorThrown, jqXHR)
            },
        })
    })
}

(function getUsername() {
    return new Promise(resolve => {
        $.ajax({
            type: "GET",
            url: "/getUsername",
            success: function(response) {
                consoleLog("CURRENT PAGE", currentPage)
                if (Object.values(paths).includes(currentPage)) {
                    document.getElementById("username-holder").innerText = response.comp.toUpperCase() + " - " + response.username

                    socket.emit("username", {name: response})
                    resolve(response)
                }   
            }
        })
    })
})()

function requestData(url, data) {
    return new Promise(resolve => {
        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: url,
            data: JSON.stringify(data),
            success: function (response) {
                consoleLog(response)
                resolve(response)
            },

            error: function (jqXHR, textStatus, errorThrown) {
                consoleLog("Error\n" + errorThrown, jqXHR)
            },
        })
    })
}

function selectRandom(obj)
{
    let num =  obj[Math.round(Math.random() * (obj.length - 1))]
    return num
}

//returns the rgb value given a color
function getColor(color)
{
    if(color == "red")
    {
        return "rgb(255,0,0)"
    }
    else if(color == "yellow")
    {
        return "rgb(255,245,0)"
    }
    else
    {
        return "rgb(0,255,0)"
    }
}   

function arrHasDuplicates(arr) {
    for(let i = 0; i < arr.length; i++) {
        for(let j = i+1; j < arr.length; j++) {
            if(arr[i] == arr[j]) {
                return true
            }
        }
    }
    return false
}

async function requestPage(url, data, pageVal) {
    const reqIdOld = ++reqId
    consoleLog("\nURL: " + url)
    $.ajax({
        type: "GET",
        contentType: "application/json",
        url: url,
        data: JSON.stringify(data),
        success: function(response) {
            if (reqIdOld == reqId) {
                consoleLog(response, "PAGE RES")
                currentPage = pageVal ? pageVal : url

                let temp

                if (response["logout"]) {
                    return window.location.replace("/login")
                }

                $(response).each(function() {
                if ($(this).attr('id') == "page-holder") {
                    temp = $(this)
                }
                })

                document.body.removeChild(document.getElementById("page-holder"))

                $("body").append(temp)
            }
        },

        error: function(jqXHR, textStatus, errorThrown)
        {
            consoleLog("Error loading page (h)\n" + errorThrown, jqXHR)
            consoleLog(textStatus)
            consoleLog("debug trace: \nurl: " + url + "\ndata " + data + "\npageVal: " + pageVal)
        },
    })
}

function isObject(o) {
    return o && typeof(o) == "object" && !Array.isArray(o)
}

function deepMerge(target, ...sources) {
    for (const s of sources) {
        if (isObject(s)) {
            for (const k of Object.keys(s)) {
                if (isObject(s[k])) {
                    if (isObject(target[k])) {
                        deepMerge(target[k], s[k])
                    } else {
                        target[k] = Object.assign({}, s[k])
                    }
                }
                else {
                    if (isObject(target[k])) {
                        Object.assign(target[k], {[k]: s[k]})
                    } else {
                        target[k] = s[k]
                    }
                }
            }
        }
    }

    return target
}

function checkPage(path) {
    return currentPage.split("?")[0] == path
}

//console.dir(deepMerge({a: 1, b: {x: 69}}, { b : { c: { d: { e: 12345}}}}))

export {consoleLog, lerpColor, lerpOpacity, insideTriangle, checkPage, isObject, waitForElem, deepMerge, canvasFPS, lerp, socket, currentPage, clamp, selectRandom, getColor, requestPage, paths, arrHasDuplicates, getMatch, requestData, highlightColors}
