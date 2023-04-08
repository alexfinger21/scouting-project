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


    teamSelector.addEventListener("change", async (e) => {
        consoleLog("hi")
        const data = await requestPage(paths.teamDetails + "?team=" + teamSelector.value, {}, paths.teamDetails)

<<<<<<< Updated upstream
        consoleLog(data)
    }) 
=======
        console.log(data)
    })

    pitScoutingButton.addEventListener("click", (e) => {
        const pitScoutingContainer = document.getElementById("pit-scouting-container")
        console.log(pitScoutingContainer.style.display)
        if(pitScoutingContainer.style.display == "none") {
            console.log("wow")
            pitScoutingContainer.style.display == "block"
        }
        else {
            console.log("not cool")
            pitScoutingContainer.style.display == "none"
        }
         
    })
>>>>>>> Stashed changes
}