import {currentPage, paths, requestPage, consoleLog} from "./utility.js"

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (removed_node) {
            consoleLog(currentPage)
            if (removed_node.id == 'page-holder' && currentPage == paths.matchStrategy) {
                main()
            }
        })
    })
})

observer.observe(document.body, { subtree: false, childList: true });
window.addEventListener("load", main)

function main() {
    const select = document.getElementById("available-matches")
    select.onchange = () => {
        consoleLog("\n\nSELECT VALUE\n" + select.value)
        consoleLog("REQUEST PAGE\n\n")
        requestPage(paths.matchStrategy + "?match=" + select.value + "&selectedPage=comments-page", {}, paths.matchStrategy)
    }

}