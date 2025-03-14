import { arrHasDuplicates, paths, currentPage, consoleLog } from "./utility.js"

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        for (const removed_node of mutation.removedNodes) {
            if (removed_node.id == 'page-holder' && currentPage == paths.adminPage) {
                consoleLog(removed_node, currentPage)
                main()
                break
            }
        }
    })
})

observer.observe(document.body, { subtree: false, childList: true });

function assignUsers(data) {
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: paths.adminPage,
        data: JSON.stringify(data),
        success: function (response) {
            if (response.response == true) {
                //resolve([true])
            }
            else {
                //resolve([false])
            }
        },

        error: function (jqXHR, textStatus, errorThrown) {
            resolve([false])
        },
    })
}

function main() {
    const selections = Array.from(document.getElementsByClassName("select-user"))
    const submitButton = document.getElementById("admin-submit")

    submitButton.addEventListener("click", () => {
        //animate the button click effect
        submitButton.style.backgroundColor = "#3b86cc"
        submitButton.style.boxShadow = "0 2px #1c3750"
        submitButton.style.transform = "translateY(4px)"

        //get all the data
        const data = new Array(selections.length)
        for (let i = 0; i < selections.length; i++) {
            if (selections[i].getAttribute("name") != "seventh-scouter") { //seventh scouter should be last
                data[i] = {
                    alliance: (i < 3 && "B") || "R",
                    position: i % 3 + 1,
                    id: selections[i].value,
                }
            }
        }
        data[6] = {
            alliance: "X",
            position: 0,
            id: selections[6].value,
        }

        consoleLog(data.map((obj) => {
            return obj.id
        }))

        if (arrHasDuplicates(data.map((obj) => {
            return obj.id
        }))) { //can't have duplicates
            alert("You assigned a user more than once")
        }
        else { //send post request
            assignUsers(data)
        }

        //animate the button back
        setTimeout(() => {
            submitButton.style.backgroundColor = "#3492EA"
            submitButton.style.boxShadow = "0 6px #3077b9"
            submitButton.style.transform = ""
        }, 100); //in milliseconds
    })
}
