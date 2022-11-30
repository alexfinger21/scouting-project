


window.addEventListener("load", function() {
    console.log(document.getElementsByClassName("centerform")[0])
    const form = document.getElementsByClassName("centerform")[0]

    form.onsubmit = (event) => {
        event.preventDefault()

        const children = form.children[0].children

        console.log(children)

        for (const child of children) {
            console.log(child.tagName.toLowerCase())
        }

        return false
    }
})