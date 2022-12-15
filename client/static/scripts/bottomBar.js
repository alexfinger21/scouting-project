window.addEventListener("load", () => {

    const footerPageButtons = Array.from(document.getElementsByClassName("footer-page-button"))

    const hoverButton = document.createElement('div');
    hoverButton.style.position = "absolute"
    hoverButton.style.backgroundColor = "#ffffff"
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
            //btn.style.backgroundColor = "#ffffff"
        })
    })

    console.log(buttonUrls)
})