import {clamp} from "./utility.js"

window.addEventListener("load", () => {
    const buttonContainers = document.getElementsByClassName("NumberButtonContainer")

    for (const container of buttonContainers) {
        for (const child of container.children) {
            if (child.tagName.toLowerCase() == "input") {
                //numerical value
                const parent = child.parentElement

                let plusButton = parent.getElementsByTagName("button")[0]
                let subtractButton = parent.getElementsByTagName("button")[1]
                let input = parent.getElementsByTagName("input")[0]

                const inputMin = Number(input.min)
                const inputMax = Number(input.max) 

                plusButton.addEventListener("click", (event) => {
                    input.value = clamp(Number(input.value) + 1, inputMin, inputMax)
                })

                subtractButton.addEventListener("click", (event) => {
                    input.value = clamp(Number(input.value) - 1, inputMin, inputMax)
                })
            }
        }
    }
})