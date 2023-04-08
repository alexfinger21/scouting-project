import { socket, paths, requestData, requestPage, currentPage, consoleLog} from "./utility.js"

socket.on("allianceSelection", (match_num) => {
    consoleLog("nice")
    consoleLog(currentPage)
    if (currentPage == paths.allianceInput) {
        requestPage(paths.allianceInput)
    }
})

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (removed_node) {
            if (removed_node.id == 'page-holder' && currentPage == paths.allianceInput) {
                main()
            }
        })
    })
})

observer.observe(document.body, { subtree: false, childList: true });
window.addEventListener("load", main)

function sendData(data) {
    consoleLog(data)
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
    consoleLog("ADD VALUE")
    const selectors = document.getElementsByClassName("alliance-input-selector")

    $.ajax({
        type: "GET",
        contentType: "application/json",
        url: paths.allianceInput + "?getTeams=true",
        data: JSON.stringify({}),
        success: function (response) {
            consoleLog("response:\n")
            consoleLog(response)
            const teams = Array.from(response.teams)
            
            for (const selector of selectors) {
                if (selector.getAttribute("old-value") == value) {
                    selector.setAttribute("old-value", selector.value)
                }
                else {
                    //$(selector).insertAfter("<option>" + value + "</option>")
                    if (teams.indexOf(value) != 0) {
                        consoleLog(teams.indexOf(value))
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
            const table = document.getElementById("selected-team-table")
            const parent = selector.parentElement.parentElement
            const cell = table.rows[parent.parentNode.rowIndex].cells[1]
            const captainSelector = cell.children[0].children[0]
            consoleLog("CAPTAIN VALUE: " + captainSelector.value)
            if(captainSelector == selector || captainSelector.value != "") {
                if(selector.value == "") {
                    addValueToSelectors(Number(selector.getAttribute("old-value")))
                    sendData({
                        allianceNum: (parent.parentNode.rowIndex - 1) / 2,
                        pos: parent.cellIndex - 1,
                        team: selector.value,
                        action: "REMOVE",
                    })
                }
                else {
                    selector.setAttribute("old-value", selector.value)
                    removeValueFromSelectors(selector.value)
                    selector.setAttribute("old-value", selector.value)
                    sendData({
                        allianceNum: (parent.parentNode.rowIndex - 1) / 2,
                        pos: parent.cellIndex - 1,
                        team: selector.value,
                        action: "INSERT",
                    })
                    consoleLog("SENT")
                }
            }
            else { //no captain, dont let them change it
                selector.value = selector.getAttribute("old-value")
            }
        })
    }
}