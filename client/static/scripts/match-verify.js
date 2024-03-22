import {  paths, requestPage, socket, currentPage, consoleLog} from "./utility.js"
import { moveToPage, setSelectedObject } from "./bottomBar.js"
import { YEAR, COMP } from "./game.js"

//scroll animations
const scrollObserver = new IntersectionObserver((entries) => { //runs whenever the visibility of an element changes
    consoleLog("Mayer was here")
    entries.forEach((entry) => { //theres 8 dictionaries containing one property, go through until you find isIntersecting
        consoleLog("hi")
        if (entry.isIntersecting) { //is in the viewport (user scrolled in)
            entry.target.classList.add("show") //fade in
        }
        else { //left the viewport (user scrolled out)
            entry.target.classList.remove("show") //fade out
        }
    })
})

//When match listing is loaded, call the main function 
const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        for (const removed_node of mutation.removedNodes) {
            if (removed_node.id == 'page-holder' && currentPage == paths.matchVerify) {
                main()
                break
            }
        }
    })
})
observer.observe(document.body, { subtree: false, childList: true });


function pressSave() {
    return new Promise(resolve => {
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: paths.matchVerify,
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
    //animate on scroll
    consoleLog("animate")
    const hiddenElements = document.getElementsByClassName("hidden");
    Array.from(hiddenElements).forEach((elm) => {
        scrollObserver.observe(elm);
    })

    const submitButton = document.getElementById("match-verify-submit")

    submitButton.addEventListener("click", () => {
        //animate the button click effect
        submitButton.style.backgroundColor = "#3b86cc"
        submitButton.style.boxShadow = "0 2px #1c3750"
        submitButton.style.transform = "translateY(4px)"

        pressSave()

        //animate the button back
        setTimeout(() => {
            submitButton.style.backgroundColor = "#3492EA"
            submitButton.style.boxShadow = "0 6px #3077b9"
            submitButton.style.transform = ""
        }, 100); //in milliseconds
    })
}
