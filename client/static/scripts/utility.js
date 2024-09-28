const log = true
const debugLog = false //shows where console logs came from
const canvasFPS = 40

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
                    document.getElementById("username-holder").innerText = response

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
    const oldCurrentPage = currentPage 
    consoleLog("\nURL: " + url)
    $.ajax({
        type: "GET",
        contentType: "application/json",
        url: url,
        data: JSON.stringify(data),
        success: function(response) {
            if (oldCurrentPage == currentPage) {
                consoleLog(currentPage)
                currentPage = pageVal ? pageVal : url

                let temp

                $(response).each(function() {
                if ($(this).attr('id') == "page-holder") {
                    temp = $(this)
                }
                })
                consoleLog(temp)

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

export {consoleLog, checkPage, isObject, waitForElem, deepMerge, canvasFPS, lerp, socket, currentPage, clamp, selectRandom, getColor, requestPage, paths, arrHasDuplicates, getMatch, requestData, highlightColors}
