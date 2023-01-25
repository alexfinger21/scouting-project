//When alliance selector is loaded, call the main function 
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
    console.log("GRRRR \n \n \n \n")
    const divs = document.getElementsByClassName("selected-team")

    for (let i = 0; i < divs.length; i++)
    {
        const wrapper = divs[i]
        const button = wrapper.getElementsByTagName("button")[0]

        button.addEventListener("click", () => {
            //change to empty class
            wrapper.classList.replace("selected-team", "empty-team")
            //change text content
            button.textContent = "Empty"
        })
    }

}