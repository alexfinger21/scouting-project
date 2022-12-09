import {clamp} from "./utility.js"

window.addEventListener("load", () => {
    const buttonContainers = document.getElementsByClassName("NumberButtonContainer")

    for (const container of buttonContainers) {
        for (const child of container.children) {
            if (child.tagName.toLowerCase() == "input") {
                //numerical value
                const parent = child.parentElement
                let input = parent.getElementsByTagName("input")[0]

                if (input.type == "number") {
                    let plusButton = parent.getElementsByTagName("button")[0]
                    let subtractButton = parent.getElementsByTagName("button")[1]
    
                    const inputMin = Number(input.min)
                    const inputMax = Number(input.max) 
    
                    plusButton.addEventListener("click", (event) => {
                        input.value = clamp(Number(input.value) + 1, inputMin, inputMax)
                    })
    
                    subtractButton.addEventListener("click", (event) => {
                        input.value = clamp(Number(input.value) - 1, inputMin, inputMax)
                    })
                }
                else if (input.type == "checkbox") {
                    let xButton = parent.getElementsByTagName("button")[0]
                    let checkButton = parent.getElementsByTagName("button")[1]

                    xButton.addEventListener("click", (event) => {
                        xButton.style.backgroundColor = "#3492EA";
                        checkButton.style.backgroundColor = "D9D9D9";
                    })
    
                    checkButton.addEventListener("click", (event) => {
                        checkButton.style.backgroundColor = "#3492EA";
                        xButton.style.backgroundColor = "D9D9D9";
                    })
                }
            }
        }
    }
})