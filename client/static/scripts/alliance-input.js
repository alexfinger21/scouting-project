import {paths, requestData, requestPage } from "./utility.js"

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

function main() {
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: paths.allianceInput,
        data: JSON.stringify(data),
        success: function(response) {
            console.log(response)
        },

        error: function(jqXHR, textStatus, errorThrown)
        {
            console.log("Error\n" + errorThrown, jqXHR)
        },
    })
}