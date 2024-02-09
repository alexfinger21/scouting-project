import { clamp, currentPage, paths, requestPage, socket, getMatch, consoleLog, canvasFPS } from "./utility.js"
import { moveToPage, setSelectedObject } from "./bottomBar.js"
import { YEAR, COMP, GAME_TYPE } from "./game.js"
import Auton from "./data_collection/Auton.js"
import Endgame from "./data_collection/Endgame.js"

//import Endgame from "./data_collection/Endgame.js"


const timer = ms => new Promise((res, rej) => setTimeout(res, ms))
let AutonObject
let EndgameObject

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        for (const removed_node of mutation.removedNodes) {
            if (removed_node.id == 'page-holder' && currentPage == paths.dataCollection) {
                main()
                break
            }
        }
    })
})

window.onunload = saveData

socket.on("changeMatch", () => {
    consoleLog(currentPage)
    consoleLog("SWITCH PAGE to: " + paths.dataCollection.substring(1) + "\n\n\n")
    if (currentPage == paths.dataCollection) {
        requestPage(paths.dataCollection)
    }
})

const playPiecesDict = {
    cone: "../static/images/cone.svg",
    cube: "../static/images/cube.svg",
    empty: "../static/images/transparent.png",
}

//given a TD's id and index in the auton-scoring table, it returns the corresponding TD in the teleop-scoring table
function getCorrespondingTd(id, index) {
    const teleopConeButtons = document.getElementById("teleop-scoring").getElementsByClassName(id) //get all cone buttons in teleop
    const correspondingTd = teleopConeButtons.item(index) //the corresponding TD under teleop-scoring
    return correspondingTd //return the image in the TD
}

async function saveComments() {
    return new Promise(async resolve => {
        const match = document.getElementById("match-comment-selector").value
        consoleLog("MATCH NUMBER: " + match)
        const ogData = JSON.parse(localStorage.getItem("comments")) != null ? JSON.parse(localStorage.getItem("comments")) : {}
        const data = {}

        data.matchNumber = match
        data.GAME_TYPE = GAME_TYPE
        data.YEAR = YEAR
        data.COMP = COMP
        data.type = "comments"
        data.comments = {}

        Array.from(document.getElementById("comments-scroller").getElementsByClassName("input-container")).forEach(e => {
            let info = e.querySelector(".comments-team")
            let title = info.innerText
            let team = title.split(" ")[0]
            let text = e.querySelector("textarea").value
            data.comments[team] = {
                text: text,
                alliance: info.getAttribute("alliance"),
                position: info.getAttribute("pos")
            }
        })

        ogData[match] = data

        consoleLog("DATA: ")
        consoleLog(data)

        resolve(data)
    })
}


async function loadComments() {
    return new Promise(async resolve => {
        const data = JSON.parse(localStorage.getItem("comments")) != null ? JSON.parse(localStorage.getItem("comments"))[match] : {}
        consoleLog("DATA: ")
        consoleLog(data)

        Array.from(document.getElementById("comments-scroller").getElementsByClassName("input-container")).forEach(e => {
            let title = e.querySelector(".comments-team").innerText
            let team = title.split(" ")[0]
            //e.querySelector("textarea").value = data.comments[team]
        })

        resolve(true)
    })
}

async function sendComments() {
    const data = await saveComments()

    consoleLog("-------CLIENT DATA------\n")
    consoleLog(data)

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: paths.dataCollection,
        data: JSON.stringify(data),
        success: function (response) {
            consoleLog(response)
            alert("Comments saved")
            requestPage(paths.matchListing)
            const hoverButton = document.getElementById("hover-button")
            const matchListingButton = document.getElementById("match-listing-btn")
            moveToPage(hoverButton.getBoundingClientRect().left, matchListingButton.getBoundingClientRect().left, hoverButton)
            setSelectedObject(matchListingButton)
        },

        error: function (jqXHR, textStatus, errorThrown) {
            //consoleLog("Error\n" + errorThrown, jqXHR)
        },
    })
}

async function sendData() {
    const data = await saveData()
    consoleLog("-------CLIENT DATA------\n")
    consoleLog(data)

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: paths.dataCollection,
        data: JSON.stringify(data),
        success: function (response) {
            consoleLog(response)
            alert("Data saved")
            requestPage(paths.matchListing)
            const hoverButton = document.getElementById("hover-button")
            const matchListingButton = document.getElementById("match-listing-btn")
            moveToPage(hoverButton.getBoundingClientRect().left, matchListingButton.getBoundingClientRect().left, hoverButton)
            setSelectedObject(matchListingButton)
        },

        error: function (jqXHR, textStatus, errorThrown) {
            //consoleLog("Error\n" + errorThrown, jqXHR)
        },
    })
}

async function waitUntilImagesLoaded(imgs) {
    const imgMap = new Map()

    imgs.forEach((e, i) => {
        e.onload = () => {
            imgMap.set(i, true)
        }
        imgMap.set(i, false)
    })

    function checkIfTrue() {
        for (const [k, v] of imgMap) {
            if (!v) {
                return false
            }

        }

        return true
    }

    while (!checkIfTrue()) {
        consoleLog(imgMap)
        await timer(10)
    }

    return true
}

function loadData() {
    return new Promise(async (res, rej) => {
        const match = await getMatch()
        const form = document.getElementById("match-number-form")
        const buttonContainers = form.querySelectorAll(".NumberButtonContainer")
        const matchNumber = document.getElementById("match-number")
        const inputContainers = form.querySelectorAll(".input-container")
        const radioButtonContainers = form.querySelectorAll(".radio-button-container")
        const tableScrollers = form.querySelectorAll(".table-scroller")
        const localData = JSON.parse(localStorage.getItem("data"))
        const allianceColor = form.getAttribute("alliance")
        const alliancePosition = form.getAttribute("alliance-position")
        const autonCanvas = document.getElementById("auton-canvas")
        const autonCanvasContainer = autonCanvas.parentElement
        const autonCanvasCTX = autonCanvas.getContext("2d")

        const endgameCanvas = document.getElementById("endgame-canvas")
        const endgameCanvasCTX = endgameCanvas.getContext("2d")

        const autonCanvasSize = Math.min(document.getElementById("input-scroller").clientHeight, autonCanvasContainer.clientWidth)
        autonCanvas.height = autonCanvasSize
        autonCanvas.width = autonCanvasSize
        const endgameCanvasSize = Math.min(document.getElementById("input-scroller").clientHeight, autonCanvasContainer.clientWidth)
        endgameCanvas.width = endgameCanvasSize
        endgameCanvas.height = endgameCanvasSize
        const gamePieceImage = new Image()
        gamePieceImage.src = "./static/images/data-collection/orange-note.png"
        const mapImage = new Image()
        mapImage.src = `./static/images/data-collection/${allianceColor == 'B' ? "blue" : "red"}-map.jpg`
        const robotImage = new Image()
        robotImage.src = `./static/images/data-collection/${allianceColor == 'B' ? "blue" : "red"}-robot.png`
        const robotContainer = new Image()
        robotContainer.src = `./static/images/data-collection/robot-container.png`
        const legendButton = new Image()
        legendButton.src = `./static/images/data-collection/legend-button.png`
        
        const images = { gamePieceImage, robotImage, mapImage, robotContainer, legendButton }

        await waitUntilImagesLoaded(Object.values(images))

        const startingPositions = {
            "1": false,
            "2": false,
            "3": false,
            "4": false,
        }

        const templatePieceData = {
            //  Wing Notes
            "202": false,
            "203": false,
            "204": false,
            //  Center Notes
            "205": false,
            "206": false,
            "207": false,
            "208": false,
            "209": false,
            //  Endgame
            "403": 0,
            "404": 0,
            "405": 0,
        }
        const data = localData ? localData[match] : undefined
        const gameData = data?.gameData

        consoleLog("localdata for match is:")
        consoleLog(data)
        
        if(gameData && gameData["Starting Location"]) {
            startingPositions[gameData["Starting Location"]] = true
        }

        const stagePositions = {
            "1": false,
            "2": false,
            "3": false,
        }

        if(gameData && gameData["Instage Location"]) {
            stagePositions[gameData["Instage Location"]] = true
        }

        AutonObject = new Auton({ ctx: autonCanvasCTX, autonPieceData: gameData?.autonPieceData ?? templatePieceData, robotData: startingPositions, allianceColor, alliancePosition, images, cX: autonCanvas.width, cY: autonCanvas.height })
        EndgameObject = new Endgame({ ctx: endgameCanvasCTX, endgamePieceData: gameData?.spotlights ?? templatePieceData, allianceColor, robotData: stagePositions, alliancePosition, images, cX: endgameCanvas.width, cY: endgameCanvas.height })

        autonCanvas.addEventListener("click", (event) => {
            AutonObject.onClick({ event, leftOffset: autonCanvas.getBoundingClientRect().left, topOffset: autonCanvas.getBoundingClientRect().top + window.scrollY })
        })

        endgameCanvas.addEventListener("click", (event) => {
            EndgameObject.onClick({ event, leftOffset: endgameCanvas.getBoundingClientRect().left, topOffset: endgameCanvas.getBoundingClientRect().top + window.scrollY })
        })

        if (!localData) {
            return rej()
        }


        consoleLog(data)

        if (data && data.COMP == COMP && data.YEAR == YEAR && data.GAME_TYPE == GAME_TYPE) {

            //load number buttons and also checkbox/x buttons
            const numberButtonContainers = document.getElementsByClassName("NumberButtonContainer")
            Array.from(numberButtonContainers).forEach((element) => {
                const input = element.getElementsByTagName("input")[0]
                if (input.type == "number") {
                    input.value = data[input.name]
                }
                else { //+ - button
                    if (data[input.name] == true) {
                        element.children[0].style.backgroundColor = "rgb(217, 217, 217)"
                        element.children[2].style.backgroundColor = "rgb(52, 146, 234)"
                    } else {
                        element.children[2].style.backgroundColor = "rgb(217, 217, 217)"
                        element.children[0].style.backgroundColor = "rgb(52, 146, 234)"
                    }
                }
            })

            //load the radio buttons and checkboxes
            Array.from(radioButtonContainers).forEach(container => {
                Array.from(container.children).forEach(element => {
                    if (element.tagName.toLowerCase() == "input") {
                        //selected radio button or selected checkbox
                        if ( (element.type == "radio" && data[element.name] == element.value) || (element.type == "checkbox" && data[element.id])) {
                            element.checked = true
                        }
                    }
                })
            })

            //load comments
            const commentsSection = document.getElementById("comments-container")
            commentsSection.getElementsByTagName("textarea")[0].value = data.comments
        }

        return res()
    })
}

async function saveData() {
    return new Promise(async resolve => {
        const match = await getMatch()
        const ogData = JSON.parse(localStorage.getItem("data")) ?? {}
        const data = {}

        const form = document.getElementById("match-number-form")
        const radioButtonContainers = form.querySelectorAll(".radio-button-container")


        data.gameData = { ...EndgameObject?.sendData(), ...AutonObject?.sendData() }

        data.matchNumber = match

        data.GAME_TYPE = GAME_TYPE
        data.YEAR = YEAR
        data.COMP = COMP
        data.type = "scouting"

        //0th child is the title
        //1st child is the number button holder

        //number buttons and also checkbox/x buttons
        const numberButtonContainers = document.getElementsByClassName("NumberButtonContainer")
        Array.from(numberButtonContainers).forEach((element) => {
            const input = element.getElementsByTagName("input")[0]
            if (input.type == "number") {
                data[input.name] = Number(input.value)
            }
            else {
                data[input.name] = element.children[0].style.backgroundColor == "rgb(217, 217, 217)" ? true : false
            }
        })

        //radio buttons and checkboxes (new code)
        Array.from(radioButtonContainers).forEach(container => {
            Array.from(container.children).forEach(element => {
                if (element.tagName.toLowerCase() == "input") {
                    if (element.type == "radio" && element.checked) {
                        data[element.name] = element.value
                    }
                    else if (element.type == "checkbox") {
                        data[element.id] = element.checked
                    }
                }
            })
        })

        //comments
        const commentsSection = document.getElementById("comments-container")
        data.comments = commentsSection.getElementsByTagName("textarea")[0].value

        data.alliance = document.getElementById("match-number-form").getAttribute("alliance")
        data.position = document.getElementById("match-number-form").getAttribute("alliance-position")

        ogData[match] = data
        localStorage.setItem("data", JSON.stringify(ogData))

        resolve(data)
    })
}

observer.observe(document.body, { subtree: false, childList: true });


async function loadDataCollection() {

    const form = document.getElementById("match-number-form")
    const buttonContainers = document.getElementsByClassName("NumberButtonContainer")
    const matchNumber = document.getElementById("match-number")
    const inputContainers = document.getElementsByClassName("input-container")
    const radioButtonContainers = document.getElementsByClassName("radio-button-container")
    const tableScrollers = document.querySelectorAll(".table-scroller")

    let lastFrame = 0

    try {
        await loadData()
    } catch (e) {
        consoleLog(e)
    }
    function animateAuton() {
        if (currentPage == paths.dataCollection && AutonObject) {
            if ((Date.now() - lastFrame) > 1000/canvasFPS) {
                AutonObject.draw()
                EndgameObject.draw()
                lastFrame = Date.now()
            }
            window.requestAnimationFrame(animateAuton)
        }
    }

    animateAuton()

    form.onsubmit = (event) => {
        event.preventDefault()

        consoleLog("submitted!")

        sendData()
    }
    //load checkmark and number buttons
    for (const container of buttonContainers) {
        for (const child of container.children) {
            if (child.tagName.toLowerCase() == "input") {
                //numerical value
                const parent = child.parentElement
                let input = parent.getElementsByTagName("input")[0]

                if (input.type == "number") {
                    const plusButton = parent.getElementsByTagName("button")[0]
                    const subtractButton = parent.getElementsByTagName("button")[1]

                    const inputMin = Number(input.min)
                    const inputMax = Number(input.max)

                    plusButton.addEventListener("click", (event) => {
                        consoleLog("clicked")
                        input.value = clamp(Number(input.value) + 1, inputMin, inputMax)
                    })

                    subtractButton.addEventListener("click", (event) => {
                        input.value = clamp(Number(input.value) - 1, inputMin, inputMax)
                    })
                }
            } else if (child.getElementsByTagName("img").length == 1 && child.tagName.toLowerCase() == "button") {
                //img

                const parent = child.parentElement

                const xButton = parent.getElementsByTagName("button")[0]
                const checkButton = parent.getElementsByTagName("button")[1]

                //initialize ( we do init in loadData)

                //xButton.style.backgroundColor = "#D9D9D9"
                //checkButton.style.backgroundColor = "#D9D9D9"

                xButton.addEventListener("click", (event) => {
                    xButton.style.backgroundColor = "#3492EA"
                    checkButton.style.backgroundColor = "#D9D9D9"
                })

                checkButton.addEventListener("click", (event) => {
                    checkButton.style.backgroundColor = "#3492EA"
                    xButton.style.backgroundColor = "#D9D9D9"
                })
            }
        }
    }

    const submitButton = document.getElementById("data-submit")
    submitButton.addEventListener("click", () => {
        //animate the button click effect
        submitButton.style.backgroundColor = "#3b86cc"
        submitButton.style.boxShadow = "0 2px #1c3750"
        submitButton.style.transform = "translateY(4px)"

        //animate the button back
        setTimeout(() => {
            submitButton.style.backgroundColor = "#3492EA"
            submitButton.style.boxShadow = "0 6px #3077b9"
            submitButton.style.transform = ""
        }, 100); //in milliseconds
    })
}

function loadCommentsPage() {
    const form = document.getElementById("comments-page")

    form.onsubmit = (e) => {
        e.preventDefault()

        consoleLog("comments saved!")

        sendComments()
    }
}

function onTabClick() {
    const currentPage = document.getElementsByClassName("selected")[0].getAttribute("page")
    const newPage = this.getAttribute("page")
    consoleLog(currentPage + " - " + newPage)
    consoleLog(document.querySelectorAll(`[page="${newPage}"]`)[1])
    consoleLog(document.querySelectorAll(`[page="${currentPage}"]`)[1])

    if (currentPage != newPage) {
        document.querySelectorAll(`[page="${currentPage}"]`)[0].classList.remove("selected")
        document.querySelectorAll(`[page="${newPage}"]`)[0].classList.add("selected")

        if (document.querySelectorAll(`[page="${currentPage}"]`)[1]) {
            document.querySelectorAll(`[page="${currentPage}"]`)[1].style.display = "none"
        }

        if (document.querySelectorAll(`[page="${newPage}"]`)[1]) {
            document.querySelectorAll(`[page="${newPage}"]`)[1].style.display = "flex"
        }
    }
}

function main() {
    consoleLog("selected page:")
    consoleLog(document.getElementsByClassName("selected"))
    if (document.getElementById("match-number-form")) {
        loadDataCollection()
    }

    if (document.getElementsByClassName("selected")[0].getAttribute("page") == "comments-page") {
        loadCommentsPage()
        loadComments()
    }

    const matchSelector = document.getElementById("match-comment-selector")

    matchSelector.addEventListener("change", e => {
        requestPage(paths.dataCollection + "?match=" + matchSelector.value + "&selectedPage=comments-page", {}, paths.dataCollection)
    })

    document.querySelector(`[page="scouting-page"]`).addEventListener("click", loadDataCollection)
    document.querySelector(`[page="comments-page"]`).addEventListener("click", loadCommentsPage)

    document.querySelector(`[page="scouting-page"]`).addEventListener("click", onTabClick)
    document.querySelector(`[page="comments-page"]`).addEventListener("click", onTabClick)

    const saveCommentsButton = document.getElementById("save-comments")
    saveCommentsButton.addEventListener("click", () => {
        //animate the button click effect
        saveCommentsButton.style.backgroundColor = "#3b86cc"
        saveCommentsButton.style.boxShadow = "0 2px #1c3750"
        saveCommentsButton.style.transform = "translateY(4px)"

        //animate the button back
        setTimeout(() => {
            saveCommentsButton.style.backgroundColor = "#3492EA"
            saveCommentsButton.style.boxShadow = "0 6px #3077b9"
            saveCommentsButton.style.transform = ""
        }, 100); //in milliseconds
    })

}
