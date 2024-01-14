import {paths, currentPage, consoleLog} from "./utility.js"

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (removed_node) {
            if (removed_node.id == 'page-holder' && currentPage == paths.rankings) {
                main()
            }
        })
    })
})

observer.observe(document.body, { subtree: false, childList: true });
window.addEventListener("load", main)

function main() {
    let subtitle = document.querySelector("#rankings-subtitle")
    let timeText = subtitle.innerText.split(" ")
    timeText.length = 4

    consoleLog(subtitle.getAttribute("timestamp"))

    let date = new Date(subtitle.getAttribute("timestamp").replaceAll("_", " ")).toLocaleString().split(",")
    date = date[1].slice(1)

    subtitle.innerText = timeText[0].concat(" ", timeText[1], " ", timeText[2], " ", timeText[3], " ", date)
}