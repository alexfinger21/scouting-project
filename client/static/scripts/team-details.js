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
    console.log("test1.0")
    const teamSelector = document.querySelector("#team-display-selector")
    const pictureContainer = document.getElementById("team-pictures-container")
    const arrowLeft = document.getElementById("arrow-left")
    const arrowRight = document.getElementById("arrow-right")
    const picture = document.getElementById("team-picture")
    const pictureCategory = document.getElementById("team-picture-category")
    const pictureName = document.getElementById("team-picture-name")
    const tabs = Array.from(document.getElementsByClassName("team-details-tab"))
    const select = document.getElementById("auton-path-select")
    const canvas = document.getElementById("field")

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
                    renderAutonHeatMap()
                    // requestAnimationFrame(() => {
                    //     renderAutonHeatMap()
                    // })
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
        console.log("test11")
        // if (!canvas || !select || select.children.length === 0) {
        //     return
        // }

        //const canvasContainer = canvas.parentElement
        const ctx = canvas.getContext("2d")
        const selectedOption = select.children[select.selectedIndex]
        const allianceColor = selectedOption.getAttribute("alliance_color") || "B"
        // const loadpath = decodeURIComponent(
        //     selectedOption.getAttribute("auton_path") || "",
        // )

const loadpath = selectedOption.getAttribute("auton_path");

let fieldpaths = [];

if (loadpath) {
    try {
        fieldpaths = JSON.parse(decodeURIComponent(loadpath));
    } catch (err) {
        console.error("Failed to parse auton_path:", err);
    }
}

        // if (canvasCTX.reset) {
        //     canvasCTX.reset()
        // } else {
        //     canvasCTX.clearRect(0, 0, canvas.width, canvas.height)
        // }
   //let fieldpaths = loadpath

//   let fieldpaths = [
//             {"type":"path","points":[{"x":509.54004,"y":208.6875},{"x":509.54004,"y":208.6875},{"x":514.73535,"y":210.34277},{"x":520.46094,"y":212.18848},{"x":528.3291,"y":214.66211},{"x":535.86914,"y":217.04297},{"x":542.5176,"y":219.28418},{"x":548.7363,"y":221.45508},{"x":554.7617,"y":223.59277},{"x":561.1699,"y":225.75684},{"x":569.0664,"y":228.25098},{"x":576.7969,"y":230.49902},{"x":584.7383,"y":232.82324},{"x":592.3887,"y":234.98047},{"x":599.22754,"y":237.0918},{"x":604.38184,"y":238.87793},{"x":609.52637,"y":240.71777},{"x":615.292,"y":243.09277},{"x":620.3506,"y":245.16016},{"x":625.02246,"y":247.19238},{"x":629.6797,"y":249.27832},{"x":633.86035,"y":251.02637},{"x":636.8838,"y":252.29199},{"x":639.7207,"y":253.46582},{"x":642.0254,"y":254.46973},{"x":643.8828,"y":255.33496},{"x":645.68066,"y":256.2256},{"x":646.7998,"y":256.75},{"x":647.83203,"y":257.26562},{"x":649.01074,"y":257.95508},{"x":650.0781,"y":258.44727},{"x":651.0625,"y":258.9248},{"x":651.6006,"y":259.0996}]},
//             {"type":"labeled","points":[{"x":664.0,"y":270.9004}],"label":"shoot"},
//             {"type":"labeled","points":[{"x":664.0,"y":370.9004}],"label":"intake"},
//             {"type":"labeled","points":[{"x":664.0,"y":470.9004}],"label":"broke"},
//             {"type":"labeled","points":[{"x":664.0,"y":570.9004}],"label":"climb"}
//         ]; 
       //const image = await loadAutonHeatMapImages(allianceColor)
        const alliancePrefix = allianceColor == "B" ? "blue" : "red"
        const image = new Image();
        image.src = `./static/images/${alliancePrefix}-Map2026.png`;
        image.onload = () => {
            draw(image);
        };

        const scale = 0.5;

// ---- Stroke model ----
class PathStroke {
    constructor(points) {
        this.type = "path";
        this.points = points;
    }
}

class LabeledStroke {
    constructor(offset, label) {
        this.type = "labeled";
        this.offset = offset;
        this.label = label;
    }
}

function draw(image) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, 912 * scale, 899 * scale);

    fieldpaths.forEach(stroke => {
        if (stroke.type === "path") drawPathStroke(stroke);
        else drawLabeledStroke(stroke);
    });
}
function drawArrowhead(x, y, angle, size = 10) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, size / 2);
    ctx.lineTo(-size, -size / 2);
    ctx.closePath();
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.restore();
}

// function drawPathStroke(stroke) {
//     const pts = stroke.points;
//     ctx.strokeStyle = "black";
//     ctx.lineWidth = 6;

//     for (let i = 1; i < pts.length; i++) {
//         ctx.beginPath();
//         ctx.moveTo(pts[i - 1].x * scale, pts[i - 1].y * scale);
//         ctx.lineTo(pts[i].x * scale, pts[i].y * scale);
//         ctx.stroke();
//     }
// }
function drawPathStroke(stroke) {
    const pts = stroke.points;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 6;

    const arrowSpacing = 12; // draw arrow every 12 points

    for (let i = 1; i < pts.length; i++) {
        const p1 = pts[i - 1];
        const p2 = pts[i];

        // Draw the line segment
        ctx.beginPath();
        ctx.moveTo(p1.x * scale, p1.y * scale);
        ctx.lineTo(p2.x * scale, p2.y * scale);
        ctx.stroke();

        // Draw arrow every N segments
        if (i % arrowSpacing === 0) {
            const dx = (p2.x - p1.x);
            const dy = (p2.y - p1.y);
            const angle = Math.atan2(dy, dx);

            // Arrow at the midpoint of the segment
            const midX = (p1.x + p2.x) / 2 * scale;
            const midY = (p1.y + p2.y) / 2 * scale;

            drawArrowhead(midX, midY, angle);
        }
    }
}


function drawLabeledStroke(stroke) {
    const { x, y } = stroke.points[0];

    switch (stroke.label) {
        case "shoot":
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(x * scale, y * scale, 10, 0, Math.PI * 2);
            ctx.fill();
            break;
        case "intake":
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.moveTo(x * scale, y * scale - 20);
            ctx.lineTo(x * scale - 20, y * scale + 20);
            ctx.lineTo(x * scale + 20, y * scale + 20);
            ctx.closePath();
            ctx.fill();
            break;
        case "broke":
            ctx.fillStyle = "red";
            ctx.fillRect(x * scale - 25, y * scale - 25, 50, 50);
            break;
        case "climb":
            ctx.fillStyle = "green";
            ctx.fillRect(x * scale - 15, y * scale - 15, 30, 30);
            break;
    }
}
    
}

    // async function loadAutonHeatMapImages(allianceColor) {
    //     const alliancePrefix = allianceColor == "B" ? "blue" : "red"

    //     async function loadImageWithFallback(...candidates) {
    //         const validCandidates = candidates.filter(Boolean)
    //         const image = new Image()

    //         await new Promise((resolve) => {
    //             const tryLoad = (index) => {
    //                 if (index >= validCandidates.length) {
    //                     resolve(true)
    //                     return
    //                 }

    //                 image.onload = () => resolve(true)
    //                 image.onerror = () => tryLoad(index + 1)
    //                 image.src = validCandidates[index]
    //             }

    //             tryLoad(0)
    //         })

    //         return image
    //     }

    //     // const lockImage = await loadImageWithFallback("./static/images/lock.png")
    //     // const draggableImage = await loadImageWithFallback("./static/images/dropdown.png")
    //     // const gamePieceImage = await loadImageWithFallback("./static/images/data-collection/orange-note.png")
    //     const mapImage = await loadImageWithFallback(
    //         `./static/images/${alliancePrefix}-Map2026.png`,
    //     )
    //     const robotImage = await loadImageWithFallback(
    //         `./static/images/data-collection/${alliancePrefix}-robot.png`,
    //     )
    //     const robotContainerImage = await loadImageWithFallback(
    //         "./static/images/data-collection/robot-container.png",
    //     )
    //     const robotStartPosImage = await loadImageWithFallback(
    //         "./static/images/data-collection/robot-starting-pos-container.png",
    //     )
    //     // const legendButton = await loadImageWithFallback(
    //     //     "./static/images/data-collection/legend-button.png",
    //     // )
    //     // const reefLeftImage = await loadImageWithFallback(
    //     //     `./static/images/data-collection/${alliancePrefix}-reef-left.png`,
    //     // )
    //     // const reefRightImage = await loadImageWithFallback(
    //     //     `./static/images/data-collection/${alliancePrefix}-reef-right.png`,
    //     // )
    //     // const clickAreaImage = await loadImageWithFallback(
    //     //     "./static/images/data-collection/click-area.png",
    //     // )
    //     // const algaeImage = await loadImageWithFallback(
    //     //     "./static/images/data-collection/algae.png",
    //     // )
    //     // const algaeSelectedImage = await loadImageWithFallback(
    //     //     "./static/images/data-collection/algae-selected.png",
    //     // )
    //     // const proceedBtnImage = await loadImageWithFallback(
    //     //     `./static/images/data-collection/proceed-btn-${alliancePrefix}.png`,
    //     // )
    //     // const images = { lockImage, draggableImage, gamePieceImage, algaeImage, algaeSelectedImage, robotImage, mapImage, robotContainerImage, legendButton, robotStartPosImage, proceedBtnImage, reefLeftImage, reefRightImage, clickAreaImage }
    //     const images = { mapImage, robotImage, robotContainerImage, robotStartPosImage }
    //     return images
    // }

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
