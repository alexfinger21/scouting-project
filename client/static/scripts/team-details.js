import {paths, requestData, requestPage, currentPage, consoleLog} from "./utility.js"

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (removed_node) {
            consoleLog(currentPage)
            if (removed_node.id == 'page-holder' && currentPage == paths.teamDetails) {
                main()
            }
        })
    })
})

observer.observe(document.body, { subtree: false, childList: true });
window.addEventListener("load", main)

function main() {
    const teamSelector = document.querySelector("#team-display-selector")
    const pitScoutingButton = document.getElementById("pit-scouting-button")
    const pictureContainer = document.getElementById("team-pictures-container")
    const arrowLeft = document.getElementById("arrow-left")
    const arrowRight = document.getElementById("arrow-right")
    let pic = 0

    teamSelector.addEventListener("change", async (e) => {
        consoleLog("hi")
        const data = await requestPage(paths.teamDetails + "?team=" + teamSelector.value, {}, paths.teamDetails)

        consoleLog(data)
    }) 
    
    pitScoutingButton.addEventListener("click", (e) => {
        const pitScoutingContainer = document.getElementById("pit-scouting-container")
        const display = window.getComputedStyle(pitScoutingContainer, null).display;
        consoleLog(display)
        if(display == "none") {
            consoleLog("wow")
            pitScoutingContainer.style.display = "block"
        }
        else {
            consoleLog("not cool")
            pitScoutingContainer.style.display = "none"
        }
    })

    arrowLeft.addEventListener("click", (e) => {
        pic = pic == 1 ? 0 : 1

        pictureContainer.children[1].src = pictureContainer.children[1].getAttribute("pic" + String(pic))
    })

    arrowRight.addEventListener("click", (e) => {
        pic = pic == 1 ? 0 : 1

        pictureContainer.children[1].src = pictureContainer.children[1].getAttribute("pic" + String(pic))
    })
}