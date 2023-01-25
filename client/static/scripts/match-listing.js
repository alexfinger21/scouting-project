//scroll animations
const scrollObserver = new IntersectionObserver((entries) => { //runs whenever the visibility of an element changes
    entries.forEach((entry) => {
        if(entry.isIntersecting) { //is in the viewport (user scrolled in)
            entry.target.classList.add("show") //fade in
        }
        else { //left the viewport (user scrolled out)
            entry.target.classList.remove("show") //fade out
        }
    })
})

//When match listing is loaded, call the main function 
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

function main()
{
    console.log("HII!!")
    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((elm) =>{
        scrollObserver.observe(elm);
    })
}
