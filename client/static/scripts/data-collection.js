import {clamp, paths, requestPage, socket, currentPage} from "./utility.js"

const observer = new MutationObserver(function(mutations_list) {
    mutations_list.forEach(function(mutation) {
        mutation.removedNodes.forEach(function(removed_node) {
            if(removed_node.id == 'page-holder') {
                main()
			}
		});
	});
});

window.onunload = saveData

const playPiecesDict = {
    cone: "../static/images/cone.svg",
    cube: "../static/images/cube.svg",
    empty: "../static/images/transparent.png",
}

function loadData() {
    const buttonContainers = document.getElementsByClassName("NumberButtonContainer")
    const matchNumber = document.getElementById("match-number")
    const inputContainers = document.getElementsByClassName("input-container")
    const radioButtonContainers = document.getElementsByClassName("radio-button-container")
    const tableScrollers = document.querySelectorAll(".table-scroller")
    const data = JSON.parse(localStorage.getItem("data"))

    //console.log(data)

    if (data) {

        matchNumber.textContent = "Match Number: " + data.matchNumber

        Array.from(inputContainers).forEach(element => {
            const name = element.children[0].textContent
            const buttonContainer = element.children[1]

            //console.log(data[name] + " - " + name)

            Array.from(inputContainers).forEach(element => {
                const name = element.children[0].textContent
                const buttonContainer = element.children[1]
        
                if (buttonContainer.children[0].textContent == "+") {
                    //input value
                    buttonContainer.children[0].parentElement.querySelector("input").value = data[name]
                } else if ((buttonContainer.children[0].getElementsByTagName("img").length == 1 && buttonContainer.children[0].tagName.toLowerCase() == "button") || (buttonContainer.children[0].textContent == "x" && buttonContainer.children[0].tagName.toLowerCase() == "button")){
                    //image
                    //console.log(buttonContainer.children[0])
                    if (data[name]) {
                        buttonContainer.children[0].style.backgroundColor = "rgb(217, 217, 217)"
                        buttonContainer.children[2].style.backgroundColor = "rgb(52, 146, 234)"
                    } else {
                        buttonContainer.children[2].style.backgroundColor = "rgb(217, 217, 217)"
                        buttonContainer.children[0].style.backgroundColor = "rgb(52, 146, 234)"
                    }
                }
            })
        })

        Array.from(radioButtonContainers).forEach(container => {
            let containerName = container.parentElement.children[0].textContent
            let selected = data[containerName]
    
            if (selected) {
                Array.from(container.children).forEach(element => {
                    if (element.tagName.toLowerCase() == "input" && element.type == "radio" && element.value == selected) {
                        element.checked = true
                    }
                })
            }
        })

        let tableCounter = 0;

        Array.from(tableScrollers).forEach(tableContainer => {
            //console.log(tableContainer)

            const name = tableContainer.parentElement.parentElement.children[0].textContent

            tableContainer = Array.from(tableContainer.children).map(e => e.children[0].children[0])

            //console.log(data.tables)
            //console.log(data.tables[name])

            if (data.tables[name]) {
                Array.from(tableContainer).forEach(container => {
                    //console.log(container)
                    //console.log(tableCounter)

                    for (let y = 0; y<3; y++) {
                        const row = container.children[y]

                        for (let x = 0; x<3; x++) {
                            const item = row.children[x].children[0]
                            item.setAttribute("object", data.tables[name][tableCounter][y][x])
                            //console.log(item)
                            let itemImage = playPiecesDict[data.tables[name][tableCounter][y][x]]
                            if (itemImage)
                            {
                                item.children[0].src = itemImage
                            }
                            else
                            {
                                item.children[0].src = playPiecesDict["empty"]
                            }
                        }
                    }

                    tableCounter++
                })
            }
        })
    }
}

function saveData() {
    const data = {}
    const buttonContainers = document.getElementsByClassName("NumberButtonContainer")
    const matchNumber = document.getElementById("match-number")
    const inputContainers = document.getElementsByClassName("input-container")
    const radioButtonContainers = document.getElementsByClassName("radio-button-container")
    const tableScrollers = document.querySelectorAll(".table-scroller")

    data.matchNumber = Number(matchNumber.textContent.split(" ")[2])

    //0th child is the title
    //1st child is the number button holder

    //checkmark and x buttons

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

    //radio buttons

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

    //areas and the cones/cubes within them

    //none is 0, cube is 1, cone is 2 

    let tableCounter = 0;
    data.tables = {}

    Array.from(tableScrollers).forEach(tableContainer => {

        const name = tableContainer.parentElement.parentElement.children[0].textContent
        data.tables[name] = {}

        tableContainer = Array.from(tableContainer.children).map(e => e.children[0].children[0])

        Array.from(tableContainer).forEach(container => {
            //console.log(container)
            //console.log(tableCounter)
            data.tables[name][tableCounter] = {}

            for (let y = 0; y<3; y++) {
                const row = container.children[y]

                data.tables[name][tableCounter][y] = {}

                for (let x = 0; x<3; x++) {
                    const item = row.children[x].children[0].getAttribute("object")
                    //console.log(item)
                    data.tables[name][tableCounter][y][x] = item
                }
            }

            tableCounter++
        })
    })

    //console.log(data.tables)

    localStorage.setItem("data", JSON.stringify(data))

    return data 
}

observer.observe(document.body, { subtree: false, childList: true });

window.addEventListener("load", main)

function main() {
    loadData()

    const form = document.getElementById("match-number-form")
    const buttonContainers = document.getElementsByClassName("NumberButtonContainer")
    const matchNumber = document.getElementById("match-number")
    const inputContainers = document.getElementsByClassName("input-container")
    const radioButtonContainers = document.getElementsByClassName("radio-button-container")
    const tableScrollers = document.querySelectorAll(".table-scroller")
    
    form.onsubmit = (event) => {
        event.preventDefault()
        
        console.log("submitted!")

        const data = saveData()

        $.ajax({
            type: "POST",
            contentType: "application/json",   
            url: paths.dataCollection,
            data: JSON.stringify(data),
            success: function(response) {
                if (response.result == 'redirect') {
                  //redirect from the login to data collection if successful, otherwise refresh
                  window.location.replace(response.url);
                }
            },

            error: function(jqXHR, textStatus, errorThrown)
            {
                //console.log("Error\n" + errorThrown, jqXHR)
            },
        })
    }

    //load checkmark and number buttons
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
                
                //initialize ( we do init in loadData)

                //xButton.style.backgroundColor = "#D9D9D9"
                //checkButton.style.backgroundColor = "#D9D9D9"

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

    //load radio buttons

    //ANIMATE SCORING GRIDS

    //CONE ONLY BUTTONS
    const coneTds = document.getElementsByClassName("fill-cone") //table element
    for (const fillCone of coneTds) {
        const coneBtn = fillCone.getElementsByTagName("button")[0]
        const btnImg = coneBtn.getElementsByTagName("img")[0]
        
        //coneBtn.setAttribute("object", "empty")

        coneBtn.addEventListener("click", (event) => {            
            if(btnImg.src.indexOf("cone.svg") > -1 ) { //filled image, make it empty
                coneBtn.setAttribute("object", "empty")

                btnImg.src = "../static/images/transparent.png"
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

        //cubeBtn.setAttribute("object", "empty")

        cubeBtn.addEventListener("click", (event) => {            
            if(btnImg.src.indexOf("cube.svg") > -1 ) { //filled image, make it empty
                cubeBtn.setAttribute("object", "empty")
                btnImg.src = "../static/images/transparent.png"
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

        //bothBtn.setAttribute("object", "empty")

        bothBtn.addEventListener("click", (event) => {            
            if(btnImg.src.indexOf("cone.svg") > -1 ) { //filled cone, make it a cube
                btnImg.src = "../static/images/cube.svg"
                bothBtn.setAttribute("object", "cube")
            }
            else if(btnImg.src.indexOf("cube.svg") > -1) { //filled cube, make it empty
                btnImg.src = "../static/images/transparent.png"
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
        content.style.maxHeight = "30vh"
    })
    
    //close the dropdown content when the user clicks outside of the button
    window.addEventListener("click", (event) => {
        if (!event.target.matches("#dropdownImg") && !event.target.matches("#dropdown-content") && !event.target.matches("#dropdown")) { 
            //console.log(event.target)
            content.style.maxHeight = "0px"
            setTimeout(() => {
                content.style.visibility = "hidden"
            }, 200);
        }
    })
}
