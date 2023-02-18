import {paths, requestPage, socket } from "./utility.js"
import { moveToPage, setSelectedObject } from "./bottomBar.js"
let matchRunning = false
const YEAR = 2023
const EVENT_CODE = "test"

//when an admin stops a match
socket.on("stopMatch", (match_num) => {
    console.log("MATCH NUM: " + match_num)
    const matchScroller = document.getElementById("match-scroller")

    //DELETE OLD DATA
    Array.from(matchScroller.children).forEach((container) => {
        //unhighlight table
        Array.from(container.children).forEach((table) => {
            table.style.backgroundColor = "#FFF"
        })
    })
    //change play button image
    const buttons = document.getElementsByClassName("start-stop-button")
    for (const button of buttons) {
        const img = button.getElementsByTagName("img")[0]
        if (img) {
            img.src = "../static/images/play-button.png"
        }
    }
})

//when an admin starts a new match
socket.on("changeMatch", (match_num) => {
    console.log("MATCH NUM: " + match_num)
    const matchScroller = document.getElementById("match-scroller")

    //DELETE OLD DATA
    Array.from(matchScroller.children).forEach((container) => {
        //unhighlight table
        Array.from(container.children).forEach((table) => {
            table.style.backgroundColor = "#FFF"
        })
    })
    //change play button image
    const buttons = document.getElementsByClassName("start-stop-button")
    for (const button of buttons) {
        const img = button.getElementsByTagName("img")[0]
        if (img) {
            img.src = "../static/images/play-button.png"
        }
    }
    //UPDATE NEW MATCH
    const container = matchScroller.children[match_num - 1]
    //highlight table
    const tables = container.getElementsByTagName("table")
    console.log(tables)
    for (const tbl of tables) {
        tbl.style.backgroundColor = "#FFF5D6"
    }
    //change image
    const imgContainer = container.querySelector(".start-stop-button")
    if(imgContainer) { //image exists, is an admin
        imgContainer.getElementsByTagName("img")[0].src = "../static/images/stop-button.png"
    }
    console.log("GAR GAR GAR 😈😈")
})

//scroll animations
const scrollObserver = new IntersectionObserver((entries) => { //runs whenever the visibility of an element changes
    entries.forEach((entry) => { //theres 8 dictionaries containing one property, go through until you find isIntersecting
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
        mutation.removedNodes.forEach(function (removed_node) {
            if (removed_node.id == 'page-holder') {
                main()
            }
        })
    })
})


function startMatch(data) {
    return new Promise(resolve => {
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: paths.matchListing,
            data: JSON.stringify(data),
            success: function (response) {
                if (response.response == true) {
                    resolve([true])
                }
                else {
                    resolve([false, response.matchNumber])
                }
            },

            error: function (jqXHR, textStatus, errorThrown) {
                resolve([false, response.matchNumber])
            },
        })
    })
}

function stopMatch() {
    const data = {
        stop_match: true
    }
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: paths.matchListing,
        data: JSON.stringify(data),
        success: function (response) {
            //nothing to see here
        },

        error: function (jqXHR, textStatus, errorThrown) {
            //console.log("Error\n" + errorThrown, jqXHR)
        },
    })
}

observer.observe(document.body, { subtree: false, childList: true });
window.addEventListener("load", main)

function main() {
    //highlight every th element that has our team
    const thElements = document.querySelectorAll("th")
    thElements.forEach((elm) => {
        if (elm.textContent == "695") {
            //highlight the element
            elm.style.backgroundColor = "#FFD962"
        }
    })
    //play buttns
    const buttons = document.getElementsByClassName("start-stop-button")
    for (const btn of buttons) {
        let debounce = false
        //play button onclick
        btn.addEventListener("click", async (event) => {
            //get img
            //if (!debounce) {
                //debounce = true
                const img = btn.getElementsByTagName("img")[0]
                if (img.src.indexOf("play-button.png") > -1) { //press play
                    const container = img.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement

                    const data = {
                        year: YEAR,
                        event_code: EVENT_CODE,
                        gm_type: container.getAttribute("game_type"), //P, Q, or E
                        gm_number: container.getAttribute("game_number"),
                        stop_match: false
                    }

                    console.log(data)

                    const [isSuccess, matchNumber] = await startMatch(data)
                    if (!isSuccess) {
                        alert("Stop match " + matchNumber + " before starting a new match")
                        //debounce = false
                    } else {
                        //debounce = false
                    }
                }
                else { //press stop
                    //send query
                    stopMatch()
                    //debounce = false
                }
            //}
        })
    }
    //match strat buttons
    const matchStrat = document.getElementsByClassName("match-strat-button")
    for (const button of matchStrat) {
        console.log("hs")
        button.addEventListener("click", () => {
            const container = button.parentElement.parentElement.parentElement.parentElement.parentElement
            requestPage("match-strategy?match=" + container.getAttribute("game_number"))
            const hoverButton = document.getElementById("hover-button")
            const matchStrategyButton = document.getElementById("match-strategy-button")
            moveToPage(hoverButton.getBoundingClientRect().left, matchStrategyButton.getBoundingClientRect().left, hoverButton)
            setSelectedObject(matchStrategyButton)
        })
    }

    //animate on scroll
    console.log("animate")
    const hiddenElements = document.querySelectorAll(".hidden");
    hiddenElements.forEach((elm) => {
        scrollObserver.observe(elm);
        console.log("gerr")
    })
}