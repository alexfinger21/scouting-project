import {clamp, dataCollectionPath} from "./utility.js"

const observer = new MutationObserver(function(mutations_list) {
    mutations_list.forEach(function(mutation) {
        mutation.removedNodes.forEach(function(removed_node) {
            if(removed_node.id == 'page-holder') {
                main()
			}
		});
	});
});

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
}
