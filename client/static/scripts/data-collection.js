import { clamp, currentPage, paths, requestPage, socket, getMatch } from "./utility.js"
import {moveToPage, setSelectedObject} from "./bottomBar.js"

const autonArray = {}
const teleopArray = {}

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (removed_node) {
            if (removed_node.id == 'page-holder') {
                main()
            }
        })
    })
})

window.onunload = saveData

socket.on("changeMatch", () => {
    console.log(currentPage)
    console.log("SWITCH PAGE to: " + paths.dataCollection.substring(1) + "\n\n\n")
    if (currentPage == paths.dataCollection.substring(1)) {
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
    const correspondingTd = teleopConeButtons.item(index)//the corresponding TD under teleop-scoring
    return correspondingTd //return the image in the TD
}

async function sendData() {
    const data = await saveData()
    console.log("-------CLIENT DATA------\n")
    console.log(data)

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: paths.dataCollection,
        data: JSON.stringify(data),
        success: function (response) {
            console.log(response)
            alert("Data saved")
            requestPage(paths.matchListing)
            const hoverButton = document.getElementById("hover-button")
            const matchListingButton = document.getElementById("match-listing-button")
            moveToPage(hoverButton.getBoundingClientRect().left, matchListingButton.getBoundingClientRect().left, hoverButton)
            setSelectedObject(matchListingButton)
        },

        error: function (jqXHR, textStatus, errorThrown) {
            //console.log("Error\n" + errorThrown, jqXHR)
        },
    })
}

async function loadData() {
    const match = await getMatch()
    const buttonContainers = document.getElementsByClassName("NumberButtonContainer")
    const matchNumber = document.getElementById("match-number")
    const inputContainers = document.getElementsByClassName("input-container")
    const radioButtonContainers = document.getElementsByClassName("radio-button-container")
    const tableScrollers = document.querySelectorAll(".table-scroller")
    const data = JSON.parse(localStorage.getItem("data"))[match]
    //console.log(data)

    if (data) {

        Array.from(inputContainers).forEach(element => {
            const name = element.children[0].textContent
            const buttonContainer = element.children[1]

            //console.log(data[name] + " - " + name)

            Array.from(inputContainers).forEach(element => {
                const name = element.children[0].textContent
                const buttonContainer = element.children[1]

                if (buttonContainer.children[0].textContent == "+") {
                    //input value
                    buttonContainer.children[0].parentElement.querySelector("input").value = data[name]
                } else if ((buttonContainer.children[0].getElementsByTagName("img").length == 1 && buttonContainer.children[0].tagName.toLowerCase() == "button") || (buttonContainer.children[0].textContent == "x" && buttonContainer.children[0].tagName.toLowerCase() == "button")) {
                    //image
                    //console.log(buttonContainer.children[0])
                    if (data[name]) {
                        buttonContainer.children[0].style.backgroundColor = "rgb(217, 217, 217)"
                        buttonContainer.children[2].style.backgroundColor = "rgb(52, 146, 234)"
                    } else {
                        buttonContainer.children[2].style.backgroundColor = "rgb(217, 217, 217)"
                        buttonContainer.children[0].style.backgroundColor = "rgb(52, 146, 234)"
                    }
                }
            })
        })

        Array.from(radioButtonContainers).forEach(container => {
            let containerName = container.parentElement.children[0].textContent
            let selected = data[containerName]

            if (selected) {
                Array.from(container.children).forEach(element => {
                    if (element.tagName.toLowerCase() == "input" && element.type == "radio" && element.value == selected) {
                        element.checked = true
                    }
                })
            }
        })

        
        Array.from(tableScrollers).forEach(tableContainer => {
            let tableCounter = 0;
            //console.log(tableContainer)

            const name = tableContainer.parentElement.parentElement.children[0].textContent

            tableContainer = Array.from(tableContainer.children).map(e => e.children[0].children[0])

            //console.log(data.tables)
            //console.log(data.tables[name])

            if (data.tables[name]) {
                Array.from(tableContainer).forEach(container => {
                    //console.log(container)
                    //console.log(tableCounter)

                    for (let y = 0; y < 3; y++) {
                        const row = container.children[y]

                        for (let x = 0; x < 3; x++) {
                            const item = row.children[x].children[0]
                            item.setAttribute("object", data.tables[name][tableCounter][y][x])
                            //console.log(item)
                            let itemImage = playPiecesDict[data.tables[name][tableCounter][y][x]]
                            if (itemImage) {
                                item.children[0].src = itemImage
                            }
                            else {
                                item.children[0].src = playPiecesDict["empty"]
                            }
                        }
                    }

                    tableCounter++
                })
            }
        })
    }
}

async function saveData() {
    return new Promise(async resolve => {
        const match = await getMatch()
        const ogData = JSON.parse(localStorage.getItem("data")) != null ? JSON.parse(localStorage.getItem("data")) : {}
        const data = {}

        const buttonContainers = document.getElementsByClassName("NumberButtonContainer")
        const matchNumber = document.getElementById("match-number")
        const inputContainers = document.getElementsByClassName("input-container")
        const radioButtonContainers = document.getElementsByClassName("radio-button-container")
        const tableScrollers = document.querySelectorAll(".table-scroller")

        data.matchNumber = match

        //0th child is the title
        //1st child is the number button holder

        //checkmark and x buttons

        Array.from(inputContainers).forEach(element => {
            const name = element.children[0].textContent
            const buttonContainer = element.children[1]

            if (name != "Robot Auto Scoring" && name != "Robot Teleop Scoring") {
                if (buttonContainer.children[0].textContent == "+") {
                    //input value
                    data[name] = Number(buttonContainer.children[1].value)
                } else {
                    data[name] = buttonContainer.children[0].style.backgroundColor == "rgb(217, 217, 217)" ? true : false
                }
            }
        })

        //radio buttons

        Array.from(radioButtonContainers).forEach(container => {
            let containerName = container.parentElement.children[0].textContent
            let selected = false

            if (containerName != "Robot Auto Scoring" && containerName != "Robot Teleop Scoring") {
                Array.from(container.children).forEach(element => {
                    if (!selected) {
                        if (element.tagName.toLowerCase() == "input" && element.type == "radio" && element.checked) {
                            selected = element.value
                        }
                    }
                })

                data[containerName] = selected
            }
        })

        //areas and the cones/cubes within them

        //none is 0, cube is 1, cone is 2 

        data.tables = {}
        
        Array.from(tableScrollers).forEach(tableContainer => {
            let tableCounter = 0;

            const name = tableContainer.parentElement.parentElement.children[0].textContent
            data.tables[name] = {}

            tableContainer = Array.from(tableContainer.children).map(e => e.children[0].children[0])

            Array.from(tableContainer).forEach(container => {
                //console.log(container)
                //console.log(tableCounter)
                data.tables[name][tableCounter] = {}

                for (let y = 0; y < 3; y++) {
                    const row = container.children[y]

                    data.tables[name][tableCounter][y] = {}

                    for (let x = 0; x < 3; x++) {
                        const item = row.children[x].children[0].getAttribute("object")
                        //console.log(item)
                        data.tables[name][tableCounter][y][x] = item
                    }
                }

                tableCounter++
            })
        })

        data.alliance = document.getElementById("match-number-form").getAttribute("alliance")
        data.position = document.getElementById("match-number-form").getAttribute("alliance-position")

        ogData[match] = data

        //console.log(data)

        localStorage.setItem("data", JSON.stringify(ogData))

        resolve(data)
    })
}

observer.observe(document.body, { subtree: false, childList: true });

window.addEventListener("load", main)

function main() {
    loadData()

    const form = document.getElementById("match-number-form")
    const buttonContainers = document.getElementsByClassName("NumberButtonContainer")
    const matchNumber = document.getElementById("match-number")
    const inputContainers = document.getElementsByClassName("input-container")
    const radioButtonContainers = document.getElementsByClassName("radio-button-container")
    const tableScrollers = document.querySelectorAll(".table-scroller")

    //Header Code
    const content = document.getElementById("dropdown-content")

    //when the button is clicked, changes the max visible height
    dropdown.addEventListener("click", () => {
        content.style.visibility = "visible"
        content.style.display = "block"
        content.style.maxHeight = "30vh"
    })
    
    //close the dropdown content when the user clicks outside of the button
    window.addEventListener("click", (event) => {
        if (!event.target.matches("#dropdownImg") && !event.target.matches("#dropdown-content") && !event.target.matches("#dropdown")) { 
            //console.log(event.target)
            content.style.maxHeight = "0px"
            setTimeout(() => {
                content.style.visibility = "hidden"
            }, 200);
        }
    })
    
    form.onsubmit = (event) => {
        event.preventDefault()

        console.log("submitted!")

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

    //load radio buttons

    //ANIMATE SCORING GRIDS

    //CONE ONLY BUTTONS
    const coneTds = document.getElementsByClassName("fill-cone") //table element
    let coneButtonIndex = 0
    for (const fillCone of coneTds) {
        const coneBtn = fillCone.getElementsByTagName("button")[0]
        const btnImg = coneBtn.getElementsByTagName("img")[0]
        const savedIndex = coneButtonIndex //saves the index as it is when the for loop reaches this cone
        
        //coneBtn.setAttribute("object", "empty")
        
        coneBtn.addEventListener("click", (event) => {
            const parent = fillCone.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement

            if (btnImg.src.indexOf("cone.svg") > -1) { //filled image, make it empty
                coneBtn.setAttribute("object", "empty")

                btnImg.src = "../static/images/transparent.png"

                if (parent.id == "auto-scoring") { //if its in auto, remove the gray cone under teleop scoring
                    const correspondingTd = getCorrespondingTd("fill-cone", savedIndex)
                    const correspondingBtn = correspondingTd.getElementsByTagName("button")[0]
                    correspondingBtn.getElementsByTagName("img")[0].src = "../static/images/transparent.png" //remove image
                    //make it clickable
                    correspondingBtn.removeAttribute("disabled")
                }
            }
            else { //its empty, make it a cone
                btnImg.src = "../static/images/cone.svg"
                coneBtn.setAttribute("object", "cone")

                if (parent.id == "auto-scoring") { //if its in auto, add a gray cone under teleop scoring
                    const correspondingTd = getCorrespondingTd("fill-cone", savedIndex)
                    const correspondingBtn = correspondingTd.getElementsByTagName("button")[0]
                    correspondingBtn.getElementsByTagName("img")[0].src = "../static/images/gray-cone.svg" //add image
                    correspondingBtn.setAttribute("object", "empty") //set attribute

                    //make it not clickable
                    correspondingBtn.setAttribute("disabled", "disabled")
                }
            }
        })

        coneButtonIndex++
    }

    //CUBE ONLY BUTTONS
    const cubeTds = document.getElementsByClassName("fill-cube") //table element
    let cubeButtonIndex = 0
    for (const fillCube of cubeTds) {
        const cubeBtn = fillCube.getElementsByTagName("button")[0]
        const btnImg = cubeBtn.getElementsByTagName("img")[0]
        let savedIndex = cubeButtonIndex

        //cubeBtn.setAttribute("object", "empty")

        cubeBtn.addEventListener("click", (event) => {
            const parent = fillCube.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement

            if (btnImg.src.indexOf("cube.svg") > -1) { //filled image, make it empty
                cubeBtn.setAttribute("object", "empty")
                btnImg.src = "../static/images/transparent.png"

                if (parent.id == "auto-scoring") { //if its in auto, remove the gray cube under teleop scoring
                    const correspondingTd = getCorrespondingTd("fill-cube", savedIndex)
                    const correspondingBtn = correspondingTd.getElementsByTagName("button")[0]
                    correspondingBtn.getElementsByTagName("img")[0].src = "../static/images/transparent.png" //remove image
                    //make it clickable
                    correspondingBtn.removeAttribute("disabled")
                }
            }
            else { //its empty, make it a cube
                btnImg.src = "../static/images/cube.svg"
                cubeBtn.setAttribute("object", "cube")

                if (parent.id == "auto-scoring") { //if its in auto, add a gray cube under teleop scoring
                    const correspondingTd = getCorrespondingTd("fill-cube", savedIndex)
                    const correspondingBtn = correspondingTd.getElementsByTagName("button")[0]
                    correspondingBtn.getElementsByTagName("img")[0].src = "../static/images/gray-cube.svg" //add image
                    correspondingBtn.setAttribute("object", "empty") //set attribute

                    //make it not clickable
                    correspondingBtn.setAttribute("disabled", "disabled")
                }
            }
        })

        cubeButtonIndex++
    }

    //BUTTONS THAT HAVE EITHER A CUBE OR A CONE
    //CLICK ONCE FOR CONE, CLICK AGAIN FOR CUBE, CLICK AGAIN TO EMPTY
    const bothTds = document.getElementsByClassName("fill-both") //table element
    let bothButtonIndex = 0

    for (const fillBoth of bothTds) {
        const bothBtn = fillBoth.getElementsByTagName("button")[0]
        const btnImg = bothBtn.getElementsByTagName("img")[0]
        let savedIndex = bothButtonIndex

        //bothBtn.setAttribute("object", "empty")

        bothBtn.addEventListener("click", (event) => {
            const parent = fillBoth.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement

            if (btnImg.src.indexOf("cone.svg") > -1) { //filled cone, make it a cube
                btnImg.src = "../static/images/cube.svg"
                bothBtn.setAttribute("object", "cube")

                if (parent.id == "auto-scoring") { //if its in auto, add a gray cube under teleop scoring
                    const correspondingTd = getCorrespondingTd("fill-both", savedIndex)
                    const correspondingBtn = correspondingTd.getElementsByTagName("button")[0]
                    correspondingBtn.getElementsByTagName("img")[0].src = "../static/images/gray-cube.svg" //add image
                    correspondingBtn.setAttribute("object", "empty")
                    //make it not clickable
                    correspondingBtn.setAttribute("disabled", "disabled")
                }
            }
            else if (btnImg.src.indexOf("cube.svg") > -1) { //filled cube, make it empty
                btnImg.src = "../static/images/transparent.png"
                bothBtn.setAttribute("object", "empty")

                if (parent.id == "auto-scoring") { //if its in auto, remove the gray cube under teleop scoring
                    const correspondingTd = getCorrespondingTd("fill-both", savedIndex)
                    const correspondingBtn = correspondingTd.getElementsByTagName("button")[0]
                    correspondingBtn.getElementsByTagName("img")[0].src = "../static/images/transparent.png" //remove image
                    //make it clickable
                    correspondingBtn.removeAttribute("disabled")
                }
            }
            else { //its empty, make it a cone
                btnImg.src = "../static/images/cone.svg"
                bothBtn.setAttribute("object", "cone")

                if (parent.id == "auto-scoring") { //if its in auto, add a gray cone under teleop scoring
                    const correspondingTd = getCorrespondingTd("fill-both", savedIndex)
                    const correspondingBtn = correspondingTd.getElementsByTagName("button")[0]
                    correspondingBtn.getElementsByTagName("img")[0].src = "../static/images/gray-cone.svg" //add image
                    correspondingBtn.setAttribute("object", "empty") //set attribute
                    //make it not clickable
                    correspondingBtn.setAttribute("disabled", "disabled")
                }
            }
        })

        bothButtonIndex++
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
