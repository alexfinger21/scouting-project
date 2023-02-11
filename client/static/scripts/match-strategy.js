import {requestPage, matchStrategySelectedGame} from "./utility.js"

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
    const select = document.getElementById("available-matches")
    select.value = matchStrategySelectedGame
    select.onchange = () => {
        console.log("garrety gar gra")
        matchStrategySelectedGame = select.value
        requestPage("match-strategy")
    }

}