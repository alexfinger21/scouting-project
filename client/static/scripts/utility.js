const log = true
let currentPage = "/match-listing"

const paths = {
    dataCollection: "/data-collection",
    login: "/login",
    matchListing: "/match-listing",
    matchStrategy: "/match-strategy",
    adminPage: "/admin-page",
    teamSummary: "/team-summary",
    teamDetails: "/team-details",
    allianceInput: "/alliance-input",
    allianceSelector: "/alliance-selector",
    rankings: "/rankings",
}

function consoleLog(arg) {
    if (log) {
        console.log(arg)
    }
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


export {consoleLog, socket, currentPage, clamp, selectRandom, getColor, requestPage, paths, arrHasDuplicates, getMatch, requestData, highlightColors}