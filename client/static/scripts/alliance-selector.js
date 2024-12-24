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

function getTeamsFromTr(tr) {
    return Array.from(tr.children).map((e) =>  e.innerText) 
}

function getAvailableTeams(sortValue, teams) {
    return new Promise(resolve => {
        
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: paths.allianceSelector,
            data: JSON.stringify({ sortBy: sortValue, teams }),
            success: function (response) {
                resolve(response)
            },
    
            error: function (jqXHR, textStatus, errorThrown) {
    
            },
        })
    })

}

function replaceAvailableTeams(teams) {
    //delete everything inside
    const table = document.getElementById("available-teams-table")
    const tbody = table.getElementsByTagName("tbody")[0]

    tbody.replaceChildren() //replaces all the children with an array of new children
    
    for (const team of teams) {
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
}

function replaceSuggestedPicks(teams) {
    const table = document.getElementById("alliance-suggestions")
    const tbody = table.getElementsByTagName("tbody")[0]

    tbody.replaceChildren() //replaces all the children with an array of new children

    for (let i = 0; i < Math.min(teams.length, 5); i++) {
        const html = "<tr><td>"
            + teams[i].team
            + "</td><td>"
            + teams[i].name 
            + "</td><td>" 
            + teams[i].suggestion
            + "</td></tr> "
        
        tbody.insertAdjacentElement("beforeend", $(html)[0]) 
    }
}

function main() {
    //when a team buton is clicked, make it empty
    const sortBy = document.getElementById("sorting-options")
    const allianceRows = document.getElementById("alliance-display-table").getElementsByTagName("tbody")[0].getElementsByTagName("tr") 
    let selectedRow
    for (const tr of allianceRows) {
        tr.addEventListener("click", (event) => {
            if(selectedRow) {
                selectedRow.style.backgroundColor = "transparent"
            }
            if(tr != selectedRow) {
                selectedRow = tr
                tr.style.backgroundColor = "yellow"
            }
            getAvailableTeams(selectedRow, getTeamsFromTr(selectedRow)).then((sortedTeams, suggestedPicks) => {
                replaceAvailableTeams(sortedTeams)
                replaceSuggestedPicks(suggestedPicks)
            })
        })
    }

    getAvailableTeams(sortBy).then((sortedTeams) => {
        replaceAvailableTeams(sortedTeams)
        replaceSuggestedPicks(sortedTeams)
    })


    sortBy.addEventListener("change", (e) => {
        getAvailableTeams(sortBy.value).then((sortedTeams) => {
            replaceAvailableTeams(sortedTeams)
        })
    })
}
