import {paths, requestData, requestPage, currentPage} from "./utility.js"

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (removed_node) {
            console.log(currentPage)
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
    const pictureContainer = document.getElementById("team-pictures-container")
    const arrowLeft = document.getElementById("arrow-left")
    const arrowRight = document.getElementById("arrow-right")


    teamSelector.addEventListener("change", async (e) => {
        console.log("hi")
        const data = await requestPage(paths.teamDetails + "?team=" + teamSelector.value, {}, paths.teamDetails)

        console.log(data)
    }) 
}