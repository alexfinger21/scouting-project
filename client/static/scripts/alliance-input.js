import { socket, paths, requestData, requestPage} from "./utility.js"

socket.on("allianceSelection", (match_num) => {
    if (currentPage == paths.allianceInput.substring(1)) {
        requestPage(paths.allianceInput)
    }
})

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (removed_node) {
            if (removed_node.id == 'page-holder') {
                main()
            }
        })
    })
})

observer.observe(document.body, { subtree: false, childList: true });
window.addEventListener("load", main)

function sendData(data) {
    console.log(data)
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: paths.allianceInput,
        data: JSON.stringify(data),
        success: function (response) {
            
        },

        error: function (jqXHR, textStatus, errorThrown) {
            
        },
    })
}

function removeValueFromSelectors(value) {
    const selectors = document.getElementsByClassName("alliance-input-selector")
    for (const selector of selectors) {
        if(selector.value != value) {
            for(const option of selector.children) {
                if(option.value == value) {
                   option.remove()
               }
           }
        }
    }
}

function addValueToSelectors(value) {
    console.log("ADD VALUE")
    const selectors = document.getElementsByClassName("alliance-input-selector")

    $.ajax({
        type: "GET",
        contentType: "application/json",
        url: paths.allianceInput + "?getTeams=true",
        data: JSON.stringify({}),
        success: function (response) {
            console.log("response:\n")
            console.log(response)
            const teams = Array.from(response.teams)
            
            for (const selector of selectors) {
                if (selector.getAttribute("old-value") == value) {
                    selector.setAttribute("old-value", selector.value)
                }
                else {
                    //$(selector).insertAfter("<option>" + value + "</option>")
                    if (teams.indexOf(value) != 0) {
                        console.log(teams.indexOf(value))
                        for (const child of selector.children) {
                            if (child.value == teams[teams.indexOf(value) - 1]) {
                                child.insertAdjacentElement("afterend", $("<option>" + value + "</option>")[0])
                                break
                            }
                        }
                    } else {
                        Array.from(selector.children)[0].insertAdjacentElement("afterend", $("<option>" + value + "</option>")[0])
                    }
                }
            }
        },

        error: function (jqXHR, textStatus, errorThrown) {
            
        },
    })
}

function main() {
    const selectors = document.getElementsByClassName("alliance-input-selector")
    for (const selector of selectors) {
        selector.addEventListener("change", (event) => {
            if(selector.value == "") {
                addValueToSelectors(Number(selector.getAttribute("old-value")))
                sendData({
                    allianceNum: (selector.parentElement.parentElement.parentNode.rowIndex - 1) / 2,
                    pos: selector.parentElement.parentElement.cellIndex - 1,
                    team: selector.value,
                    action: "REMOVE",
                })
            }
            else {
                selector.setAttribute("old-value", selector.value)
                removeValueFromSelectors(selector.value)
                selector.setAttribute("old-value", selector.value)
                sendData({
                    allianceNum: (selector.parentElement.parentElement.parentNode.rowIndex - 1) / 2,
                    pos: selector.parentElement.parentElement.cellIndex - 1,
                    team: selector.value,
                    action: "INSERT",
                })
                console.log("SENT")
            }
        })
    }
}