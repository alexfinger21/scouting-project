window.addEventListener("load", () => {
    const buttonContainers = document.getElementsByClassName("NumberButtonContainer")

    for (const container of buttonContainers) {
        console.log(container.children)
    }
})