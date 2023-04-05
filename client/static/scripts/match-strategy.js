import {currentPage, paths, requestPage} from "./utility.js"

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (removed_node) {
            console.log(currentPage)
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
        console.log("\n\nSELECT VALUE\n" + select.value)
        console.log("REQUEST PAGE\n\n")
        requestPage(paths.matchStrategy + "?match=" + select.value)
    }

}