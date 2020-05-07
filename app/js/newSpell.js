const {remote} = require("electron"), currWindow = remote.getCurrentWindow(),
    appOptions = require("../data/Options.json"), appClientArea = document.querySelector('.client-area'), appPageHolder = document.querySelector('.page-holder');
const levelInput = document.querySelector('#spell-level .input'), schoolInput = document.querySelector('#spell-school .input')
function change_level(elem) {
    let current = elem.innerHTML
    if (current === 'Cantrip'){
        current = 0
    } else {
        current = parseInt(current)
    }
    const out = (current + 1) % (appOptions.spellLevelMax + 1);
    if (out === 0){
        elem.innerHTML = 'Cantrip'
    } else {
        elem.innerHTML = out
    }
}
function choose_school() {
    const schools = appOptions.schools;
    let screen = document.createElement('DIV');
    screen.className = 'focus-screen';
    let select = document.createElement('DIV');
    select.className = 'select-box';
    select.innerHTML = '<div class="title">Select School</div>'
    for (const school in schools){
        if (!schools.hasOwnProperty(school)) continue;
        select.innerHTML +=
            `
                <div id="${schools[school]}" class="option" onclick="select_school(this)">${schools[school]}</div>
                `
    }
    appClientArea.appendChild(screen);
    appClientArea.appendChild(select)
}
function select_school(selected) {
    schoolInput.innerHTML = selected.id;
    appClientArea.removeChild(appClientArea.lastChild)
    appClientArea.removeChild(appClientArea.lastChild)
}