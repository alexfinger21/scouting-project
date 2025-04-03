import AutonHeatMap from "./data_collection/AutonHeatMap.js"
import {paths, requestData, requestPage, currentPage, consoleLog, waitUntilImagesLoaded, canvasFPS} from "./utility.js"

let heatMapObject

//template url: https://www.thebluealliance.com/team/6964/2023

/*
let globalPos = 

function moveToPos(ogPos, pos, btn) {
    if (!isHighlightVisible) {
        btn.style.opacity = 1
    }

    if (pos == globalPos) return
    
    globalPos = pos

    return new Promise((res, rej) => {    
        //consoleLog(speed/Math.abs(pos-ogPos))
        for (let i = 0; i <= 1; i+=speed/Math.abs(pos-ogPos)) {
            if (pos != globalPos) {
                rej("already clicked")
                return
            }

            //consoleLog(btn.style.left)

            setTimeout(() => {btn.style.left = ogPos + (pos-ogPos) * i + "px"}, 100*i)

            if (i+speed/Math.abs(pos-ogPos) > 1) {
                i = 1
            }
        }

        res("done")
    })
}

*/

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        for (const removed_node of mutation.removedNodes) {
            if (removed_node.id == 'page-holder' && currentPage == paths.teamDetails) {
                main()
                break
            }
        }
    })
})

observer.observe(document.body, { subtree: false, childList: true });

async function main() {
    const teamSelector = document.querySelector("#team-display-selector")
    const pitScoutingButton = document.getElementById("pit-scouting-button")
    const pictureContainer = document.getElementById("team-pictures-container")
    const arrowLeft = document.getElementById("arrow-left")
    const arrowRight = document.getElementById("arrow-right")
    const tabs = Array.from(document.getElementsByClassName("team-details-tab"))

    let selectedPage = ""
    tabs.forEach((tab) => {
        if(tab.classList.contains("selected")) {
            selectedPage = tab.getAttribute("page")
        }
    })
    
    //handle tabs
    tabs.forEach((tab) => {
        tab.addEventListener("click", (e) => {
            if(!tab.classList.contains("selected")) {
                tabs.forEach((unselectedTab) => {
                    if(unselectedTab.classList.contains("selected")) {
                        consoleLog(unselectedTab.getAttribute("page"))
                        const oldPage = document.getElementById(unselectedTab.getAttribute("page"))
                        oldPage.style.display = "none"
                        unselectedTab.classList.remove("selected")
                    }
                })
                tab.classList.toggle("selected")
                selectedPage = tab.getAttribute("page")
                const newPage = document.getElementById(selectedPage)
                newPage.style.display = "block"
            }
        })
    })

    //handle images
    let pic = 0

    teamSelector.addEventListener("change", async (e) => {
        consoleLog("SELECTED PAGE: " + selectedPage)
        const data = await requestPage(paths.teamDetails + "?team=" + teamSelector.value + "&selectedPage=" + selectedPage, {}, paths.teamDetails)

        consoleLog(data)
    }) 

    function switchImage() {
        const container = pictureContainer.children[1]
        consoleLog("pic" + String(pic % container.getAttribute("num-pictures")))
        container.src = container.getAttribute("pic" + String(pic % container.getAttribute("num-pictures")))
    }

    arrowLeft.addEventListener("click", (e) => {
        pic -= 1
        switchImage()
    })

    arrowRight.addEventListener("click", (e) => {
        pic += 1
        switchImage()
    })

    const canvas = document.getElementById("heat-map")
    const canvasContainer = canvas.parentElement
    const canvasCTX = canvas.getContext("2d")
    const allianceColor = "B"

    const canvasSize = canvasContainer.clientWidth
    canvas.width = canvasSize
    canvas.height = canvasSize*595/763
    const lockImage = new Image()
    lockImage.src = "./static/images/lock.png"
    const draggableImage = new Image()
    draggableImage.src = "./static/images/dropdown.png"
    const gamePieceImage = new Image()
    gamePieceImage.src = "./static/images/data-collection/orange-note.png"
    const mapImage = new Image()
    mapImage.src = `./static/images/data-collection/${allianceColor == 'B' ? "blue" : "red"}-map.png`
    const robotImage = new Image()
    robotImage.src = `./static/images/data-collection/${allianceColor == 'B' ? "blue" : "red"}-robot.png`
    const robotContainerImage = new Image()
    robotContainerImage.src = `./static/images/data-collection/robot-container.png`
    const robotStartPosImage = new Image()
    robotStartPosImage.src = `./static/images/data-collection/robot-starting-pos-container.png`
    const legendButton = new Image()
    legendButton.src = `./static/images/data-collection/legend-button.png`
    const reefLeftImage = new Image()
    reefLeftImage.src = `./static/images/data-collection/${allianceColor == 'B' ? "blue" : "red"}-reef-left.png`
    const reefRightImage = new Image()
    reefRightImage.src = `./static/images/data-collection/${allianceColor == 'B' ? "blue" : "red"}-reef-right.png`
    const clickAreaImage = new Image()
    clickAreaImage.src = `./static/images/data-collection/click-area.png`
    const algaeImage = new Image()
    algaeImage.src = `./static/images/data-collection/algae.png`
    const algaeSelectedImage = new Image()
    algaeSelectedImage.src = `./static/images/data-collection/algae-selected.png`
    const proceedBtnImage = new Image()
    proceedBtnImage.src = `./static/images/data-collection/proceed-btn-${allianceColor == 'B' ? "blue" : "red"}.png`
    const images = { lockImage, draggableImage, gamePieceImage, algaeImage, algaeSelectedImage, robotImage, mapImage, robotContainerImage, legendButton, robotStartPosImage, proceedBtnImage, reefLeftImage, reefRightImage, clickAreaImage }

    await waitUntilImagesLoaded(Object.values(images))

    heatMapObject = new AutonHeatMap({ ctx: canvasCTX, data: {}, allianceColor, images, cX: canvas.width, cY: canvas.height })
    
    // HANDLE TOUCHES / MOUSE

    function handleMouse(event, obj, func) {
        const x = event.pageX - event.target.getBoundingClientRect().left - window.scrollX
        const y = event.pageY - event.target.getBoundingClientRect().top - window.scrollY

        func.call(obj, { x, y, event })
    }

    canvas.addEventListener("click", (event) => {
        consoleLog("herherherere")
        //event.preventDefault()
        handleMouse(event, heatMapObject, heatMapObject.onClick)
    })

    let lastFrame = 0
 
    function animateCanvas() {
        if (currentPage == paths.teamDetails && heatMapObject) {
            if ((Date.now() - lastFrame) > 1000/canvasFPS) {
                heatMapObject.draw()
                heatMapObject.renderQueue.render()
                lastFrame = Date.now()
            }
            window.requestAnimationFrame(animateCanvas)
        }
    }
    animateCanvas()
    
}
