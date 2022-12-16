let globalPos = 0;
const speed = 10;

function moveToPage(ogPos, pos, btn) {
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

window.addEventListener("load", () => {

    const footerPageButtons = Array.from(document.getElementsByClassName("footer-page-button"))

    const hoverButton = document.createElement('div');
    hoverButton.style.position = "absolute"
    hoverButton.style.backgroundColor = "#cce6ff"
    hoverButton.style.zIndex = 1

    //hoverButton.style.top = String(footerPageButtons[0].getBoundingClientRect().top) + "px"
    hoverButton.style.left = String(footerPageButtons[0].getBoundingClientRect().left) + "px"

    $(hoverButton).width(footerPageButtons[0].clientWidth)
    $(hoverButton).height(footerPageButtons[0].clientHeight)

    document.getElementById("footer-wrapper").append(hoverButton)

    let buttonUrls = []

    footerPageButtons.forEach((btn, index) => {
        buttonUrls[btn.children[1].textContent] = btn.children[1].textContent.replaceAll(" ", "-").toLowerCase()

        btn.addEventListener("click", event => {
            moveToPage(hoverButton.getBoundingClientRect().left, btn.getBoundingClientRect().left, hoverButton)
        })
    })

    console.log(buttonUrls)
})