import { paths } from "./utility.js"

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


function assignUsers(data) {
    return new Promise(resolve => {
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: paths.adminPage,
            data: JSON.stringify(data),
            success: function (response) {
                if (response.response == true) {
                    resolve([true])
                }
                else {
                    resolve([false])
                }
            },

            error: function (jqXHR, textStatus, errorThrown) {
                resolve([false])
            },
        })
    })
}

function main() {
    var selections  = Array.from(document.getElementsByClassName("select-user"))
    const submitButton = document.getElementById("admin-submit")

    submitButton.addEventListener("click", () => {
        //animate the button clicAk effect
        submitButton.style.backgroundColor = "#3b86cc"
        submitButton.style.boxShadow = "0 2px #1c3750"
        submitButton.style.transform = "translateY(4px)"

        //get all the data
        const data = new Array(selections.length)
        for(let i = 0; i < selections.length; i++) {
            data[i] = selections[i].value
            console.log(selections[i].value)
        }
        
        //send post request
        assignUsers(data)

        //animate the button back
        setTimeout(() => {
            submitButton.style.backgroundColor = "#3492EA"
            submitButton.style.boxShadow = "0 6px #3077b9"
            submitButton.style.transform = ""
        }, 100); //in milliseconds
    })
}