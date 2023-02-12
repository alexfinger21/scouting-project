import {requestPage} from "./utility.js"


let globalPos = 0;
const speed = 10;
let isHighlightVisible = false
let selectedObj = document.getElementById("match-listing-btn")

function hideHighlight(btn) {
    btn.style.opacity = 0
    isHighlightVisible = false
}

function moveToPage(ogPos, pos, btn) {
    if (!isHighlightVisible) {
        btn.style.opacity = 1
    }

    if (pos == globalPos) return
    
    globalPos = pos

    return new Promise((res, rej) => {    
        //console.log(speed/Math.abs(pos-ogPos))
        for (let i = 0; i <= 1; i+=speed/Math.abs(pos-ogPos)) {
            if (pos != globalPos) {
                rej("already clicked")
                return
            }

            //console.log(btn.style.left)

            setTimeout(() => {btn.style.left = ogPos + (pos-ogPos) * i + "px"}, 100*i)

            if (i+speed/Math.abs(pos-ogPos) > 1) {
                i = 1;
            }
        }

        res("done")
    })
}

function setSelectedObject(value) {
    selectedObj = value
}

window.addEventListener("load", () => {
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
            console.log(buttonUrls[btn.children[1].textContent])
            requestPage(buttonUrls[btn.children[1].textContent], {})
            moveToPage(hoverButton.getBoundingClientRect().left, btn.getBoundingClientRect().left, hoverButton)
            selectedObj = btn
        })
    })

    const allianceSelectorButton = document.getElementById("alliance-selector-button")
    allianceSelectorButton.addEventListener("click", () =>  {
        requestPage("alliance-selector")
        hideHighlight(hoverButton)
    })
    
    const adminPageButton = document.getElementById("admin-page-button")
    adminPageButton.addEventListener("click", () =>  {
        requestPage("admin-page")
        hideHighlight(hoverButton)
    })
    
    const resizeObserver = new ResizeObserver((entries) => {
        $(hoverButton).width(footerPageButtons[0].clientWidth)
        $(hoverButton).height(footerPageButtons[0].clientHeight)
        
        console.log(selectedObj.getBoundingClientRect().left)
        
        hoverButton.style.left = selectedObj.getBoundingClientRect().left + "px"
    })
    
    resizeObserver.observe(document.body)
    requestPage("match-listing")
})

export {moveToPage, setSelectedObject}