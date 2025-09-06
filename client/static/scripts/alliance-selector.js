//When alliance selector is loaded, call the main function 
import { paths, requestPage, socket, currentPage, consoleLog } from "./utility.js"

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
    return Array.from(tr.children).map((e) => e.innerText)
}

function getTeamRankings(pickedAlliance, teams) {
    consoleLog("PICKED: ", pickedAlliance)
    return new Promise(resolve => {
        consoleLog("GOT HERE")
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: paths.allianceSelector,
            data: JSON.stringify({ alliance: pickedAlliance, teams }),
            success: function (response) {
                consoleLog("answer", response)
                resolve(response)
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error getting alliance picks", errorThrown)
                resolve(false)
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
        let t = team[0]
        const html = "<tr><td>"
            + t.name
            + "</td><td>"
            + t.props.api_rank
            + "</td><td>"
            + Math.round(t.props.total_game_score_avg)
            + "</td><td>"
            + t.props.auton_total_score_avg.toFixed(1)
            + "</td><td>"
            + t.props.teleop_notes_speaker_not_amped_avg.toFixed(1)
            + "</td><td>"
            + t.props.teleop_notes_speaker_amped_avg.toFixed(1)
            + "</td><td>"
            + t.props.teleop_notes_amp_avg.toFixed(1)
            + "</td><td>"
            + t.props.endgame_onstage_points_avg.toFixed(1)
            + "</td><td>"
            + t.props.endgame_notes_trap_avg.toFixed(1)
            + "</td></tr> "

        tbody.insertAdjacentElement("beforeend", $(html)[0])
    }
}

function replaceSuggestedPicks(teams) {
    const table = document.getElementById("alliance-suggestions")
    const tbody = table.getElementsByTagName("tbody")[0]

    tbody.replaceChildren() //replaces all the children with an array of new children

    if (teams) {
        for (let i = 0; i < Math.min(teams.length, 5); i++) {
            const t = teams[i][0]
            const html = "<tr><td>"
                + "<b>" + (i + 1) + "</b>"
                + "</td><td>"
                + t.tm_num
                + "</td><td>"
                + `<p>${t.suggestions.best}</p><p>` + t.suggestions.successful.join("</p><p>") + "</p><p>" + t.suggestions.unsuccessful.join("</p><p>") + "</p><p>"
                + "</td></tr> "

            tbody.insertAdjacentElement("beforeend", $(html)[0])
        }
    }
    else {
        for (let i = 0; i < 5; i++) {
            const html = "<tr><td>"
                + "<b>" + (i + 1) + "</b>"
                + "</td><td></td><td></td>"

            tbody.insertAdjacentElement("beforeend", $(html)[0])
        }
    }
}

function main() {
    //when a team buton is clicked, make it empty
    const sortBy = document.getElementById("sorting-options")
    const headerText = document.getElementById("alliance-selector-header")
    const allianceRows = document.getElementById("alliance-display-table").getElementsByTagName("tbody")[0].getElementsByTagName("tr")
    let selectedRow
    for (const tr of allianceRows) {
        tr.addEventListener("click", (event) => {
            if (selectedRow) {
                consoleLog("HERE")
                selectedRow.style.backgroundColor = "transparent"
                headerText.innerText = "Alliance Picks For Alliance: None"
            }
            if (tr != selectedRow) {
                selectedRow = tr
                tr.style.backgroundColor = "yellow"
                const alNum = selectedRow.children[0].innerText
                headerText.innerText = "Alliance Picks For Alliance: " + alNum
                getTeamRankings(alNum, getTeamsFromTr(selectedRow)).then((ranks) => {
                    if (ranks.length) {
                        if (sortBy.value == "best") {
                            replaceAvailableTeams(ranks)
                        }
                        replaceSuggestedPicks(ranks)
                    }
                })
            }
            else {
                selectedRow = null
                //replaceAvailableTeams(null)
                replaceSuggestedPicks(null)
            }
        })
    }

    /* getAvailableTeams(sortBy).then((sortedTeams) => {
        replaceAvailableTeams(sortedTeams)
        replaceSuggestedPicks(sortedTeams)
    }) */


    sortBy.addEventListener("change", (e) => {
        getTeamRankings(selectedRow ? selectedRow.children[0].innerText : 1, getTeamsFromTr(selectedRow ?? allianceRows[0])).then((ranks) => {
            if (!ranks.length) {
                return
            }
            switch (sortBy.value) {
                case "best":
                    replaceAvailableTeams(ranks)
                    break
                case "scoring":
                    replaceAvailableTeams(ranks.sort((a, b) => {
                        return b[0].props.total_game_score_avg - a[0].props.total_game_score_avg
                    }))
                    break
                case "auton":
                    replaceAvailableTeams(ranks.sort((a, b) => {
                        return b[0].props.auton_total_score_avg - a[0].props.auton_total_score_avg
                    }))
                    break
                case "speaker":
                    replaceAvailableTeams(ranks.sort((a, b) => {
                        return b[0].props.teleop_notes_speaker_not_amped_avg + b[0].props.teleop_notes_speaker_amped_avg  - a[0].props.teleop_notes_speaker_not_amped_avg - a[0].props.teleop_notes_speaker_amped_avg
                    }))
                    break
                case "amp":
                    replaceAvailableTeams(ranks.sort((a, b) => {
                        return b[0].props.auton_notes_amp_avg + b[0].props.teleop_notes_amp_avg  - a[0].props.auton_notes_amp_avg - a[0].props.teleop_notes_amp_avg
                    }))
                    break
                case "stage":
                    replaceAvailableTeams(ranks.sort((a, b) => {
                        return b[0].props.endgame_onstage_points_avg - a[0].props.endgame_onstage_points_avg
                    }))
                    break
                case "trap":
                    replaceAvailableTeams(ranks.sort((a, b) => {
                        return b[0].props.endgame_notes_trap_avg - a[0].props.endgame_notes_trap_avg
                    }))
                    break
            }
        })
    })
}
