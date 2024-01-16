import {paths, currentPage, consoleLog} from "./utility.js"

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        for (const removed_node of mutation.removedNodes) {
            if (removed_node.id == 'page-holder' && currentPage == paths.rankings) {
                main()
                break
            }
        }
    })
})

observer.observe(document.body, { subtree: false, childList: true });

function main() {
    let subtitle = document.querySelector("#rankings-subtitle")
    let timeText = subtitle.innerText.split(" ")
    timeText.length = 4

    consoleLog(subtitle.getAttribute("timestamp"))

    let date = new Date(subtitle.getAttribute("timestamp").replaceAll("_", " ")).toLocaleString().split(",")
    date = date[1].slice(1)

    subtitle.innerText = timeText[0].concat(" ", timeText[1], " ", timeText[2], " ", timeText[3], " ", date)
}
