const { copy } = require("../../../server/routers/admin-page");

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
    var select  = document.getElementsByClassName("select-user")
    select.addEventListener("changed", () => {
        
    })
}