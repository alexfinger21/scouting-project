//When alliance selector is loaded, call the main function 
import { paths, requestPage, socket, currentPage, consoleLog} from "./utility.js"

socket.on("allianceSelection", (match_num) => {
    if (currentPage == paths.allianceSelector) {
        requestPage(paths.allianceSelector)
    }
})

const observer = new MutationObserver(function (mutations_list) {
    mutations_list.forEach(function (mutation) {
        for (const removed_node of mutation.removedNodes) {
            if (removed_node.id == 'page-holder' && currentPage == paths.allianceSelector) {
                main()
                break
            }
        }
    })
})

observer.observe(document.body, { subtree: false, childList: true });

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
            for (const team of response) {
                const html = "<tr><td>"
                    + team.team
                    + "</td><td>"
                    + team.apiRank 
                    + "</td><td>" 
                    + Math.round(team.gameScore) 
                    + "</td><td>" 
                    + team.auton.toFixed(1) 
                    + "</td><td>" 
                    + team.speakerScore.toFixed(1)
                    + "</td><td>" 
                    + team.ampScore.toFixed(1) 
                    + "</td><td>" 
                    + team.stageScore.toFixed(1) 
                    + "</td><td>" 
                    + team.trapScore.toFixed(1) 
                    + "</td></tr> "
                
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
