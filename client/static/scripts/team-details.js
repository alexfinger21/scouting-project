import AutonHeatMap from "./data_collection/AutonHeatMap.js"
import {paths, requestData, requestPage, currentPage, consoleLog, canvasFPS} from "./utility.js"

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

function resetTeamDetailsScroll(selectedPageId = "") {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    const pageHolder = document.getElementById("page-holder")
    if (pageHolder) {
        pageHolder.scrollTop = 0
    }

    const scrollers = Array.from(
        document.getElementsByClassName("team-details-scroller"),
    )

    scrollers.forEach((scroller) => {
        scroller.scrollTop = 0
    })

    if (selectedPageId) {
        const selectedScroller = document.getElementById(selectedPageId)
        if (selectedScroller) {
            selectedScroller.scrollTop = 0
        }
    }
}

async function main() {
    const teamSelector = document.querySelector("#team-display-selector")
    const pictureContainer = document.getElementById("team-pictures-container")
    const arrowLeft = document.getElementById("arrow-left")
    const arrowRight = document.getElementById("arrow-right")
    const picture = document.getElementById("team-picture")
    const pictureCategory = document.getElementById("team-picture-category")
    const pictureName = document.getElementById("team-picture-name")
    const tabs = Array.from(document.getElementsByClassName("team-details-tab"))
    const select = document.getElementById("auton-path-select")
    const canvas = document.getElementById("heat-map")

    let selectedPage = ""
    tabs.forEach((tab) => {
        if(tab.classList.contains("selected")) {
            selectedPage = tab.getAttribute("page")
        }
    })

    resetTeamDetailsScroll(selectedPage)
    requestAnimationFrame(() => resetTeamDetailsScroll(selectedPage))
    
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
                resetTeamDetailsScroll(selectedPage)

                if (selectedPage == "auton-display-page") {
                    requestAnimationFrame(() => {
                        renderAutonHeatMap()
                    })
                }
            }
        })
    })

    //handle images
    let pic = 0

    teamSelector.addEventListener("change", async (e) => {
        consoleLog("SELECTED PAGE: " + selectedPage)
        resetTeamDetailsScroll(selectedPage)
        const data = await requestPage(paths.teamDetails + "?team=" + teamSelector.value + "&selectedPage=" + selectedPage, {}, paths.teamDetails)

        consoleLog(data)
    }) 

    function switchImage() {
        if (!picture) {
            return
        }

        const count = Number(picture.getAttribute("num-pictures"))
        if (!count || count < 1) {
            return
        }

        const normalizedIndex = ((pic % count) + count) % count
        picture.src = picture.getAttribute("pic" + String(normalizedIndex))
        picture.alt = picture.getAttribute("pic" + String(normalizedIndex) + "name") || "Pit scouting image"

        if (pictureCategory) {
            pictureCategory.textContent =
                picture.getAttribute("pic" + String(normalizedIndex) + "label") ||
                "Pit Image"
        }

        if (pictureName) {
            pictureName.textContent =
                picture.getAttribute("pic" + String(normalizedIndex) + "name") ||
                "Uploaded image"
        }
    }

    if (pictureContainer && arrowLeft && arrowRight && picture) {
        arrowLeft.addEventListener("click", () => {
            pic -= 1
            switchImage()
        })

        arrowRight.addEventListener("click", () => {
            pic += 1
            switchImage()
        })
    }

    async function renderAutonHeatMap() {
        if (!canvas || !select || select.children.length === 0) {
            return
        }

        const canvasContainer = canvas.parentElement
        const canvasCTX = canvas.getContext("2d")
        const selectedOption = select.children[select.selectedIndex]
        const allianceColor = selectedOption.getAttribute("alliance_color") || "B"
        const loadpath = decodeURIComponent(
            selectedOption.getAttribute("auton_path") || "",
        )

        const canvasWidth = Math.min(canvasContainer.clientWidth, 900)
        canvas.width = canvasWidth
        canvas.height = canvasWidth * 595 / 763

        if (canvasCTX.reset) {
            canvasCTX.reset()
        } else {
            canvasCTX.clearRect(0, 0, canvas.width, canvas.height)
        }

        const images = await loadAutonHeatMapImages(allianceColor)

        heatMapObject = new AutonHeatMap({
            ctx: canvasCTX,
            data: {auton: {path: loadpath}},
            allianceColor,
            images,
            cX: canvas.width,
            cY: canvas.height,
        })

        heatMapObject.draw()
        heatMapObject.renderQueue.render()
    }

    async function loadAutonHeatMapImages(allianceColor) {
        const alliancePrefix = allianceColor == "B" ? "blue" : "red"

        async function loadImageWithFallback(...candidates) {
            const validCandidates = candidates.filter(Boolean)
            const image = new Image()

            await new Promise((resolve) => {
                const tryLoad = (index) => {
                    if (index >= validCandidates.length) {
                        resolve(true)
                        return
                    }

                    image.onload = () => resolve(true)
                    image.onerror = () => tryLoad(index + 1)
                    image.src = validCandidates[index]
                }

                tryLoad(0)
            })

            return image
        }

        const lockImage = await loadImageWithFallback("./static/images/lock.png")
        const draggableImage = await loadImageWithFallback("./static/images/dropdown.png")
        const gamePieceImage = await loadImageWithFallback("./static/images/data-collection/orange-note.png")
        const mapImage = await loadImageWithFallback(
            `./static/images/data-collection/${alliancePrefix}-map.png`,
        )
        const robotImage = await loadImageWithFallback(
            `./static/images/data-collection/${alliancePrefix}-robot.png`,
        )
        const robotContainerImage = await loadImageWithFallback(
            "./static/images/data-collection/robot-container.png",
        )
        const robotStartPosImage = await loadImageWithFallback(
            "./static/images/data-collection/robot-starting-pos-container.png",
        )
        const legendButton = await loadImageWithFallback(
            "./static/images/data-collection/legend-button.png",
        )
        const reefLeftImage = await loadImageWithFallback(
            `./static/images/data-collection/${alliancePrefix}-reef-left.png`,
        )
        const reefRightImage = await loadImageWithFallback(
            `./static/images/data-collection/${alliancePrefix}-reef-right.png`,
        )
        const clickAreaImage = await loadImageWithFallback(
            "./static/images/data-collection/click-area.png",
        )
        const algaeImage = await loadImageWithFallback(
            "./static/images/data-collection/algae.png",
        )
        const algaeSelectedImage = await loadImageWithFallback(
            "./static/images/data-collection/algae-selected.png",
        )
        const proceedBtnImage = await loadImageWithFallback(
            `./static/images/data-collection/proceed-btn-${alliancePrefix}.png`,
        )
        const images = { lockImage, draggableImage, gamePieceImage, algaeImage, algaeSelectedImage, robotImage, mapImage, robotContainerImage, legendButton, robotStartPosImage, proceedBtnImage, reefLeftImage, reefRightImage, clickAreaImage }

        return images
    }

    if (select) {
        select.addEventListener("change", () => {
            renderAutonHeatMap()
        })
    }

    if (selectedPage == "auton-display-page") {
        renderAutonHeatMap()
    }

/************* *
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

    heatMapObject = new AutonHeatMap({ ctx: canvasCTX, data: {auton: {path: loadpath }}, allianceColor, images, cX: canvas.width, cY: canvas.height })
    
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

    select.onchange = () => {
        consoleLog("replace")
        heatMapObject = new AutonHeatMap({ ctx: canvasCTX, data: {auton: {path: select.children[select.selectedIndex].getAttribute("auton_path")}}, allianceColor, images, cX: canvas.width, cY: canvas.height })
    }
********* */

    
    
}

if (document.querySelector("#team-display-selector")) {
    main()
}
