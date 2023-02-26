import { paths, requestData, requestPage } from "./utility.js"

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

function getAllianceInput() {
    let res = Array.from(new Array(8), () => new Array(3))
    const selectors = document.getElementsByClassName("alliance-input-selector")
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 3; j++) {
            res[i][j] = selectors[i * 3 + j].value
        }
    }
    return res
}

function removeValueFromSelectors(value) {
    const selectors = document.getElementsByClassName("alliance-input-selector")
    for (const selector of selectors) {
        for(const option of selector.children) {
            if(selector.value != value && option.value == value) {
                option.remove()
            }
        }
    }
}

function addValueToSelectors(value) {
    const selectors = document.getElementsByClassName("alliance-input-selector")
    for (const selector of selectors) {
        for(const option of selector.children) {
            if(selector.value != value && option.value == value) {
                const option = document.createElement("option", "value: " + value)
                
            }
        }
    }
}

function main() {
    const selectors = document.getElementsByClassName("alliance-input-selector")
    for (const selector of selectors) {
        selector.addEventListener("change", (event) => {
            console.log(getAllianceInput())
            removeValueFromSelectors(selector.value)
        })
    }
}