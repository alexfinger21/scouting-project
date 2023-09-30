import {requestPage, paths, consoleLog} from "./utility.js"

let globalPos = 0
let selectedObj = document.getElementById("match-listing-btn")

const SLIDER_EXPONENT_FACTOR = 0.8

let isHighlightVisible = false
let bottomBarDebounce = false

function hideHighlight(btn) {
    btn.style.opacity = 0
    isHighlightVisible = false
}

function lerp(start, goal, percent) {
    return (goal-start)*percent + start
}


function moveToPage(ogPos, pos, btn) {

    if (!isHighlightVisible) {
        btn.style.opacity = 1
    }

    if (pos == globalPos) return
    
    globalPos = pos

    return new Promise((res, rej) => {    
        //consoleLog(speed/Math.abs(pos-ogPos))
        let i = 0.01
        let start = undefined

        function animateBottom(ts) {
            if (!start) {
                start = ts
            }

            i = Math.pow(i, SLIDER_EXPONENT_FACTOR)
           // consoleLog("TIMESTAMP - START")
            //consoleLog(ts-start)

            //consoleLog("i = " + i)

            btn.style.left = lerp(ogPos, pos, i) + "px"
            
            if (pos != globalPos) {
                res("position was overriden")
                return
            }

            if (i >= 0.999) {
                btn.style.left = pos + "px"
                res("achieved position")
                return
            }

            window.requestAnimationFrame(animateBottom)
        }

        window.requestAnimationFrame(animateBottom)

    })
}

function setSelectedObject(value) {
    selectedObj = value
}

window.addEventListener("load", () => {
    requestPage(paths.matchListing)
    const footerPageButtons = Array.from(document.getElementsByClassName("footer-page-button"))

    const hoverButton = document.createElement('div');
    hoverButton.id = "hover-button"
    hoverButton.style.position = "absolute"
    hoverButton.style.backgroundColor = "#cce6ff"
    hoverButton.style.zIndex = 1

    //hoverButton.style.top = String(footerPageButtons[0].getBoundingClientRect().left) + "px"
    hoverButton.style.left = String(footerPageButtons[0].getBoundingClientRect().left) + "px"
    
    $(hoverButton).width(footerPageButtons[0].clientWidth)
    $(hoverButton).height(footerPageButtons[0].clientHeight)
    
    document.getElementById("footer-wrapper").append(hoverButton)
    
    let buttonUrls = []
    
    footerPageButtons.forEach((btn, index) => {
        buttonUrls[btn.children[1].textContent] = btn.children[1].textContent.replaceAll(" ", "-").toLowerCase()
        
        btn.addEventListener("click", event => {
            if (!bottomBarDebounce) {
                bottomBarDebounce = true
                consoleLog(buttonUrls[btn.children[1].textContent])
                requestPage("/" + buttonUrls[btn.children[1].textContent], {})
                moveToPage(hoverButton.getBoundingClientRect().left, btn.getBoundingClientRect().left, hoverButton)
                selectedObj = btn

            setTimeout(() => {bottomBarDebounce = false}, 300)
            }
        })
    })

    const allianceSelectorButton = document.getElementById("alliance-selector-button")
    allianceSelectorButton.addEventListener("click", () =>  {
        requestPage(paths.allianceSelector)
        hideHighlight(hoverButton)
    })

    const teamDetailsButton = document.getElementById("team-details-button")
    teamDetailsButton.addEventListener("click", () =>  {
        requestPage(paths.teamDetails)
        hideHighlight(hoverButton)
    })
    
    const adminPageButton = document.getElementById("admin-page-button")
    adminPageButton.addEventListener("click", () =>  {
        requestPage(paths.adminPage)
        hideHighlight(hoverButton)
    })

    const allianceInputButton = document.getElementById("alliance-input-button")
    allianceInputButton.addEventListener("click", () =>  {
        requestPage(paths.allianceInput)
        hideHighlight(hoverButton)
    })
    
    const resizeObserver = new ResizeObserver((entries) => {
        $(hoverButton).width(footerPageButtons[0].clientWidth)
        $(hoverButton).height(footerPageButtons[0].clientHeight)
        
        consoleLog(selectedObj.getBoundingClientRect().left)
        
        hoverButton.style.left = selectedObj.getBoundingClientRect().left + "px"
    })
    
    resizeObserver.observe(document.body)
})

export {moveToPage, setSelectedObject}