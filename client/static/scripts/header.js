import { paths, consoleLog } from "./utility.js"

window.addEventListener("load", main)

function main() {
    //Header Code
    let open = false
    let debounce = false
    const dropdown = document.getElementById("dropdown")
    const content = document.getElementById("dropdown-content")
    const logOutButton = document.getElementById("log-out-button")

    //when the button is clicked, changes the max visible height
    dropdown.addEventListener("click", () => {
        if (debounce) return
        if (!open) {
            open = true
            debounce = true
            content.style.visibility = "visible"
            content.style.display = "block"
            content.style.maxHeight = "100vh"

            setTimeout(() => {
                debounce = false
            }, 200)

        } else {
            open = false
            debounce = true
            content.style.maxHeight = "0px"
            
            setTimeout(() => {
                content.style.visibility = "hidden"
                debounce = false
            }, 200)

        }
    })

    //close the dropdown content when the user clicks outside of the button
    window.addEventListener("click", (event) => {
        if (debounce) return

        if (!event.target.matches("#dropdownImg") && !event.target.matches("#dropdown-content") && !event.target.matches("#dropdown")) {
            consoleLog(event.target)
            content.style.maxHeight = "0px"
            debounce = true
            
            setTimeout(() => {
                content.style.visibility = "hidden"
                debounce = false
            }, 200)
        }
    })

    logOutButton.addEventListener("click", (event) => {
        $.ajax({
            type: "POST",
            url: paths.logout,
            contentType: "application/json",
            success: (response) => {
                window.location.replace("/logout")
            }
        })
    })
}
