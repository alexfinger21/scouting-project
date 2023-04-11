import {paths, requestData, requestPage, currentPage, consoleLog} from "./utility.js"

/*

function moveToPos(ogPos, pos, btn) {
    if (!isHighlightVisible) {
        btn.style.opacity = 1
    }

    if (pos == globalPos) return
    
    globalPos = pos

    return new Promise((res, rej) => {    
        //consoleLog(speed/Math.abs(pos-ogPos))
        for (let i = 0; i <= 1; i+=speed/Math.abs(pos-ogPos)) {
            if (pos != globalPos) {
                rej("already clicked")
                return
            }

            //consoleLog(btn.style.left)

            setTimeout(() => {btn.style.left = ogPos + (pos-ogPos) * i + "px"}, 100*i)

            if (i+speed/Math.abs(pos-ogPos) > 1) {
                i = 1
            }
        }

        res("done")
    })
}

*/

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
    const tabs = Array.from(document.getElementsByClassName("team-details-tab"))

    //handle tabs
    tabs.forEach((tab) => {
        tab.addEventListener("click", (e) => {
            if(!tab.classList.contains("selected")) {
                tabs.forEach((unselectedTab) => {
                    if(unselectedTab.classList.contains("selected")) {
                        consoleLog(unselectedTab.getAttribute("page"))
                        const oldPage = document.getElementById(unselectedTab.getAttribute("page"))
                        oldPage.style.display = "none"
                        unselectedTab.classList.remove("selected")
                    }
                })
                tab.classList.toggle("selected")
                const newPage = document.getElementById(tab.getAttribute("page"))
                newPage.style.display = "block"
            }
        })
    })

    //handle images
    let pic = 0

    teamSelector.addEventListener("change", async (e) => {
        consoleLog("hi")
        const data = await requestPage(paths.teamDetails + "?team=" + teamSelector.value, {}, paths.teamDetails)

        consoleLog(data)
    }) 

    function arrowAction() {
        pic = pic == 1 ? 0 : 1

        pictureContainer.children[1].src = pictureContainer.children[1].getAttribute("pic" + String(pic))
    }

    arrowLeft.addEventListener("click", arrowAction)

    arrowRight.addEventListener("click", arrowAction)
}