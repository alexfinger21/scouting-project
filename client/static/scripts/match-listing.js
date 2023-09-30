import {  paths, requestPage, socket, currentPage, consoleLog} from "./utility.js"
import { moveToPage, setSelectedObject } from "./bottomBar.js"
import { YEAR, COMP } from "./game.js"

//when an admin stops a match
socket.on("stopMatch", (match_num) => {
    if (currentPage == paths.matchListing) {
        consoleLog("MATCH NUM: " + match_num)
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
    }
})

//when an admin starts a new match
socket.on("changeMatch", (match_num) => {
    if (currentPage == paths.matchListing) {
        consoleLog("MATCH NUM: " + match_num)

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
        //consoleLog(tables)
        for (const tbl of tables) {
            tbl.style.backgroundColor = "#FFF5D6"
        }
        //change image
        const imgContainer = container.querySelector(".start-stop-button")
        if  (imgContainer) { //image exists, is an admin
            imgContainer.getElementsByTagName("img")[0].src = "../static/images/stop-button.png"
        }
        //consoleLog("GAR GAR GAR 😈😈")
    }
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
            if (removed_node.id == 'page-holder' && currentPage == paths.matchListing) {
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
            //consoleLog("Error\n" + errorThrown, jqXHR)
        },
    })
}

observer.observe(document.body, { subtree: false, childList: true });
window.addEventListener("load", main)

function main() {
    //Scroll to last played match
    const matchScroller = document.getElementById("match-scroller")
    const lastPlayed = matchScroller.getAttribute("scroll-to")
    const matchTable = matchScroller.children[lastPlayed - 1]
    matchTable.scrollIntoView()


    /*highlight every th element that has our team
    const thElements = document.querySelectorAll("th")
    thElements.forEach((elm) => {
        if (elm.textContent == "695") {
            //highlight the element
            elm.style.backgroundColor = "#FFD962"
        }
    }) */
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
                    event_code: COMP,
                    gm_type: container.getAttribute("game_type"), //P, Q, or E
                    gm_number: container.getAttribute("game_number"),
                    stop_match: false
                }

                consoleLog(data)

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
        consoleLog("hs")
        button.addEventListener("click", () => {
            const container = button.parentElement.parentElement.parentElement.parentElement.parentElement
            requestPage(paths.matchStrategy + "?match=" + container.getAttribute("game_number"))
            const hoverButton = document.getElementById("hover-button")
            const matchStrategyButton = document.getElementById("match-strategy-button")
            moveToPage(hoverButton.getBoundingClientRect().left, matchStrategyButton.getBoundingClientRect().left, hoverButton)
            setSelectedObject(matchStrategyButton)
        })
    }

    const matchContainers = document.getElementsByClassName("match-container")
    for (const matchContainer of matchContainers) {
        matchContainer.addEventListener("click", (event) => {
            if (document.elementFromPoint(event.clientX, event.clientY).tagName != "IMG") { //if not clicking play button
                consoleLog("Game number: " + matchContainer.getAttribute("game_number"))
                $.ajax({
                    type: "GET",
                    contentType: "application/json",
                    url: paths.matchListing + "?getCollectedData=true&matchNumber=" + matchContainer.getAttribute("game_number"),
                    success: function (response) {
                        response = JSON.parse(response)
                        consoleLog("Response: " + response)
                        consoleLog("Response length: " + response.length)
                        const expandables = matchContainer.getElementsByClassName("expandable")
                        for (const expandable of expandables) {
                            if (expandable.getAttribute("hidden")) {
                                const ths = expandable.getElementsByTagName("th")
                                //consoleLog(response)
                                for(const th of ths) {
                                    th.innerHTML = "X"
                                }
                                for(let i = 0; i < response.length; i++) {
                                    let pos = response[i].game_matchup_gm_alliance_position - 1
                                    if(response[i].game_matchup_gm_alliance == "B") {
                                        pos += 3
                                    }
                                    if(response[i].gd_um_id != undefined) {
                                        ths[pos].innerHTML = response[i].gd_um_id.substring(0,5)
                                    }
                                    consoleLog(pos + " changed to " + response[i].gd_um_id)
                                }
                                expandable.removeAttribute("hidden")
                            }
                            else {
                                expandable.setAttribute("hidden", true)
                            }
                        }
                    },

                    error: function (jqXHR, textStatus, errorThrown) {
                        
                    },
                })
            }
        })
    }


    //animate on scroll
    consoleLog("animate")
    const hiddenElements = document.querySelectorAll(".hidden");
    hiddenElements.forEach((elm) => {
        scrollObserver.observe(elm);
        consoleLog("gerr")
    })
}