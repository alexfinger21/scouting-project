import {currentPage, paths, requestPage, consoleLog} from "./utility.js"

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        for (const removed_node of mutation.removedNodes) {
            if (removed_node.id == 'page-holder' && currentPage == paths.matchStrategy) {
                main()
                break
            }
        }
    })
})


observer.observe(document.body, { subtree: false, childList: true });

function main() {
    const select = document.getElementById("available-matches")
    select.onchange = () => {
        consoleLog("\n\nSELECT VALUE\n" + select.value)
        consoleLog("REQUEST PAGE\n\n")
        requestPage(paths.matchStrategy + "?match=" + select.value + "&selectedPage=comments-page", {}, paths.matchStrategy)
    }

}
