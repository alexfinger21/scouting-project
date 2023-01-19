import {clamp, dataCollectionPath, requestPage} from "./utility.js"

const observer = new MutationObserver(function(mutations_list) {
    mutations_list.forEach(function(mutation) {
        mutation.removedNodes.forEach(function(removed_node) {
            if(removed_node.id == 'page-holder') {
                main()
			}
		});
	});
});

function loadData() {

}

function saveData() {

}

observer.observe(document.body, { subtree: false, childList: true });

window.addEventListener("load", main)

function main() {
    const buttonContainers = document.getElementsByClassName("NumberButtonContainer")
    const form = document.getElementById("match-number-form")

    form.onsubmit = (event) => {
        event.preventDefault()
        
        const data = {}
        const dataList = document.getElementById("games-val")
        const inputContainers = document.getElementsByClassName("input-container")
        const radioButtonContainers = document.getElementsByClassName("radio-button-container")

        data.matchNumber = Number(dataList.value)

        //0th child is the title
        //1st child is the number button holder
        Array.from(inputContainers).forEach(element => {
            const name = element.children[0].textContent
            const buttonContainer = element.children[1]

            if (buttonContainer.children[0].textContent == "+") {
                //input value
                data[name] = Number(buttonContainer.children[1].value)
            } else {
                data[name] = buttonContainer.children[0].style.backgroundColor == "rgb(217, 217, 217)" ? true : false
            }
        })

        Array.from(radioButtonContainers).forEach(container => {
            let containerName = container.parentElement.children[0].textContent
            let selected = false

            Array.from(container.children).forEach(element => {
                if (!selected) {
                    if (element.tagName.toLowerCase() == "input" && element.type == "radio" && element.checked) {
                        selected = element.value
                    }
                }
            })

            data[containerName] = selected
        })

        $.ajax({
            type: "POST",
            contentType: "application/json",   
            url: dataCollectionPath,
            data: JSON.stringify(data),
            success: function(response) {
                if (response.result == 'redirect') {
                  //redirect from the login to data collection if successful, otherwise refresh
                  window.location.replace(response.url);
                }
            },

            error: function(jqXHR, textStatus, errorThrown)
            {
                console.log("Error\n" + errorThrown, jqXHR)
            },
        })
    }

    for (const container of buttonContainers) {
        for (const child of container.children) {
            if (child.tagName.toLowerCase() == "input") {
                //numerical value
                const parent = child.parentElement
                let input = parent.getElementsByTagName("input")[0]

                if (input.type == "number") {
                    const plusButton = parent.getElementsByTagName("button")[0]
                    const subtractButton = parent.getElementsByTagName("button")[1]
    
                    const inputMin = Number(input.min)
                    const inputMax = Number(input.max) 
    
                    plusButton.addEventListener("click", (event) => {
                        input.value = clamp(Number(input.value) + 1, inputMin, inputMax)
                    })
    
                    subtractButton.addEventListener("click", (event) => {
                        input.value = clamp(Number(input.value) - 1, inputMin, inputMax)
                    })
                }
            } else if (child.getElementsByTagName("img").length == 1 && child.tagName.toLowerCase() == "button") {
                //img

                const parent = child.parentElement
                
                const xButton = parent.getElementsByTagName("button")[0]
                const checkButton = parent.getElementsByTagName("button")[1]
                
                //initialize

                xButton.style.backgroundColor = "#D9D9D9"
                checkButton.style.backgroundColor = "#D9D9D9"

                xButton.addEventListener("click", (event) => {
                    xButton.style.backgroundColor = "#3492EA"
                    checkButton.style.backgroundColor = "#D9D9D9"
                })

                checkButton.addEventListener("click", (event) => {
                    checkButton.style.backgroundColor = "#3492EA"
                    xButton.style.backgroundColor = "#D9D9D9"
                })
            }
        }
    }

    //ANIMATE SCORING GRIDS

    //CONE ONLY BUTTONS
    const coneTds = document.getElementsByClassName("fill-cone") //table element
    for (const fillCone of coneTds) {
        const coneBtn = fillCone.getElementsByTagName("button")[0]
        const btnImg = coneBtn.getElementsByTagName("img")[0]
        
        coneBtn.setAttribute("object", "empty")

        coneBtn.addEventListener("click", (event) => {            
            if(btnImg.src.indexOf("cone.svg") > -1 ) { //filled image, make it empty
                coneBtn.setAttribute("object", "empty")

                btnImg.src = ""
            }
            else { //its empty, make it a cone
                btnImg.src = "../static/images/cone.svg"
                coneBtn.setAttribute("object", "cone")
            }
        })
    }

    //CUBE ONLY BUTTONS
    const cubeTds = document.getElementsByClassName("fill-cube") //table element
    for (const fillCube of cubeTds) {
        const cubeBtn = fillCube.getElementsByTagName("button")[0]
        const btnImg = cubeBtn.getElementsByTagName("img")[0]

        cubeBtn.setAttribute("object", "empty")

        cubeBtn.addEventListener("click", (event) => {            
            if(btnImg.src.indexOf("cube.svg") > -1 ) { //filled image, make it empty
                cubeBtn.setAttribute("object", "empty")
                btnImg.src = ""
            }
            else { //its empty, make it a cone
                btnImg.src = "../static/images/cube.svg"
                cubeBtn.setAttribute("object", "cube")
            }
        })
    }

    //BUTTONS THAT HAVE EITHER A CUBE OR A CONE
    //CLICK ONCE FOR CONE, CLICK AGAIN FOR CUBE, CLICK AGAIN TO EMPTY
    const bothTds = document.getElementsByClassName("fill-both") //table element
    for (const fillBoth of bothTds) {
        const bothBtn = fillBoth.getElementsByTagName("button")[0]
        const btnImg = bothBtn.getElementsByTagName("img")[0]

        bothBtn.setAttribute("object", "empty")

        bothBtn.addEventListener("click", (event) => {            
            if(btnImg.src.indexOf("cone.svg") > -1 ) { //filled cone, make it a cube
                btnImg.src = "../static/images/cube.svg"
                bothBtn.setAttribute("object", "cube")
            }
            else if(btnImg.src.indexOf("cube.svg") > -1) { //filled cube, make it empty
                btnImg.src = ""
                bothBtn.setAttribute("object", "empty")
            }
            else { //its empty, make it a cone
                btnImg.src = "../static/images/cone.svg"
                bothBtn.setAttribute("object", "cone")
            }
        })
    }

    const submitButton = document.getElementById("data-submit")
    submitButton.addEventListener("click", () => {
        //animate the button click effect
        submitButton.style.backgroundColor = "#3b86cc"
        submitButton.style.boxShadow = "0 2px #1c3750"
        submitButton.style.transform = "translateY(4px)"

        //animate the button back
        setTimeout(() => {
            submitButton.style.backgroundColor = "#3492EA"
            submitButton.style.boxShadow = "0 6px #3077b9"
            submitButton.style.transform = ""
        }, 100); //in milliseconds
    })

    const dropdown = document.getElementById("dropdown")
    const content = document.getElementById("dropdown-content")

    /*  doesn't work
    let maxHeight = 0

    Array.from(content.children).forEach((element) => {
        maxHeight += element.clientHeight
    })

    maxHeight += 10

    */

    //when the button is clicked, changes the max visible height
    dropdown.addEventListener("click", () => {
        content.style.visibility = "visible"
        content.style.display = "block"
        content.style.maxHeight = "20vh"
    })
    
    //close the dropdown content when the user clicks outside of the button
    window.addEventListener("click", (event) => {
        if (!event.target.matches("#dropdownImg") && !event.target.matches("#dropdown-content") && !event.target.matches("#dropdown")) { 
            console.log(event.target)
            content.style.maxHeight = "0px"
            setTimeout(() => {
                content.style.visibility = "hidden"
            }, 200);
        }
    })
}
