import { paths } from "./utility.js"
const YEAR = 2023
const EVENT_CODE = "test"

//scroll animations
const scrollObserver = new IntersectionObserver((entries) => { //runs whenever the visibility of an element changes
    entries.forEach((entry) => { //theres 8 dictionaries containing one property, go through until you find isIntersecting
        if(entry.isIntersecting) { //is in the viewport (user scrolled in)
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
        mutation.removedNodes.forEach(function (removed_node) {
            if (removed_node.id == 'page-holder') {
                main()
            }
        })
    })
})


function startMatch(data) {

    $.ajax({
        type: "POST",
        contentType: "application/json",   
        url: paths.matchListing,
        data: JSON.stringify(data),
        success: function(response) {
            //nothing to see here
        },

        error: function(jqXHR, textStatus, errorThrown)
        {
            //console.log("Error\n" + errorThrown, jqXHR)
        },
    })
}

observer.observe(document.body, { subtree: false, childList: true });
window.addEventListener("load", main)

function main()
{
    //highlight every th element that has our team
    const thElements = document.querySelectorAll("th")
    thElements.forEach((elm) => {
        if(elm.textContent == "695") {
            //highlight the element
            elm.style.backgroundColor = "#FFD962"
        }
    })
    //play buttns
    const buttons = document.getElementsByClassName("start-stop-button")
    for(const btn of buttons) {
        //play button onclick
        btn.addEventListener("click", (event) => {
            //get img
            const img = btn.getElementsByTagName("img")[0]
            if(img.src.indexOf("play-button.png") > -1 ) { //press play
                const container = img.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement

                const data = {
                    year: YEAR,
                    event_code: EVENT_CODE,
                    gm_type: container.getAttribute("game_type"), //P, Q, or E
                    gm_number: container.getAttribute("game_number")
                }

                console.log(data)

                startMatch(data)

                //set image
                img.src = "../static/images/stop-button.png"
                //highlight table
                const tables = container.getElementsByTagName("table")
                console.log(tables)
                for(const tbl of tables) {
                    tbl.style.backgroundColor = "#FFF5D6"
                }
            }
            else { //press stop
                //set image
                img.src = "../static/images/play-button.png"
                //unhighlight table
                const container = img.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
                const tables = container.getElementsByTagName("table")
                for(const tbl of tables) {
                    tbl.style.backgroundColor = "#FFF"
                }
            }
        })
    }
    //animate on scroll
    console.log("animate")
    const hiddenElements = document.querySelectorAll(".hidden");
    hiddenElements.forEach((elm) =>{
        scrollObserver.observe(elm);
        console.log("gerr")
    })
}
