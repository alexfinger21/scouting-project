
document.addEventListener("load", () => {

    const form = document.getElementById("login-form")

    form.onsubmit(event => {
        event.preventDefault()

        const children = form.children

        children.forEach(element => {
            console.log(element.tagName.toLowerCase())
        });

        return false;
    })
})