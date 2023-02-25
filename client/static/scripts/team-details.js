import { requestData, requestPage } from "./utility.js"

let selectedTeam

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (removed_node) {
            if (removed_node.id == 'page-holder') {
                main()
            }
        })
    })
})

observer.observe(document.body, { subtree: false, childList: true });
window.addEventListener("load", main)

function main() {
    const teamSelector = document.querySelector("#team-display-selector")

    console.log(teamSelector)

    teamSelector.addEventListener("change", async (e) => {
        console.log("hi")
        const data = await requestPage("/team-details?team=" + teamSelector.value)

        console.log(data)
    }) 
}