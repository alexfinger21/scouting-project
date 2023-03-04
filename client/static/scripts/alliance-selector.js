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

function getAvailableTeams(sortValue) {
    //delete everything inside
    const table = document.getElementById("available-teams-table")
    const tbody = table.getElementsByTagName("tbody")[0]

    tbody.replaceChildren() //replaces all the children with an array of new children

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: paths.allianceSelector,
        data: JSON.stringify({ sortBy: sortValue }),
        success: function (response) {
            console.log(response)



            console.log(tbody)

            for (const team of response) {
                const html = "<tr><td>" + team.team + "</td><td>" + team.apiRank + "</td><td>" + Math.round(team.gameScore) + "</td><td><td></td><td>" + Math.round(team.chargeStation) + "</td></tr> "
                tbody.insertAdjacentElement("beforeend", $(html)[0])
            }
        },

        error: function (jqXHR, textStatus, errorThrown) {

        },
    })
}

function main() {
    //when a team buton is clicked, make it empty
    const sortBy = document.getElementById("sorting-options")

    getAvailableTeams(sortBy.value)

    sortBy.addEventListener("change", (e) => {
        getAvailableTeams(sortBy.value)
    })
}