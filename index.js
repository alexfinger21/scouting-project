let total = 0;
let current = document.getElementById('number');
let saved_values = []

function increment() {
    total = total + 1;
    current.innerHTML = total;
}

function reset() {
    total = 0;
    current.innerHTML = total;
}

function subtract() {
    total = total - 1
    current.innerHTML = total;
}

function save() {
    saved_values.push(total)
    for (i in saved_values) {
        console.log(saved_values)
    }
}

function clearSaved() {
    saved_values = []
    console.log('Saved Values Cleared')
}