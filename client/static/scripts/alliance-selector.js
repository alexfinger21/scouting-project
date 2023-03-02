//When alliance selector is loaded, call the main function 
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

function main() {
    //when a team buton is clicked, make it empty
    const sortBy = document.getElementById("sorting-options")

    sortBy.addEventListener("change", (e) => {
        const sortValue = sortBy.value

        console.log(sortValue)

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: paths.allianceSelector,
            data: JSON.stringify({sortBy: sortValue}),
            success: function (response) {
                console.log(response)
            },

            error: function (jqXHR, textStatus, errorThrown) {

            },
        })
    })
}