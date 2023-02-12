import {paths, requestPage, selectMatchStrategyGame, getMatchStrategyGame} from "./utility.js"

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (removed_node) {
            if (removed_node.id == 'page-holder') {
                main()
            }
        })
    })
})

async function sendData(data) {
    console.log("-------CLIENT DATA------\n")
    console.log(data)

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: paths.matchStrategy,
        data: JSON.stringify(data),
        success: function (response) {
            console.log(response)
        },

        error: function (jqXHR, textStatus, errorThrown) {
            //console.log("Error\n" + errorThrown, jqXHR)
        },
    })
}

observer.observe(document.body, { subtree: false, childList: true });
window.addEventListener("load", main)

function main() {
    const select = document.getElementById("available-matches")
    select.value = getMatchStrategyGame()
    select.onchange = () => {
        selectMatchStrategyGame(select.value)
        console.log("REQUEST PAGE\n\n")
        sendData({
            matchNumber: getMatchStrategyGame()
        })
        requestPage(paths.matchStrategy)
    }

}