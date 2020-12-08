const {remote} = require("electron"), currWindow = remote.getCurrentWindow(),
    appOptions = require("../data/Options.json"), appClientArea = document.querySelector('.client-area'),
    appPageHolder = document.querySelector('.page-holder');
const levelInput = document.querySelector('#spell-level .input'),
    schoolInput = document.querySelector('#spell-school .input'),
    castActionInput = document.querySelector('#spell-cast-action .input'),
    components = [0,0,0], durationActionInput = document.querySelector('#spell-duration-action .input'),
    toHitSaveInput = document.querySelector('#to-hit-save .input'),
    effectInput = document.querySelector('#effect .input'),
    damagesInput = document.querySelector('#spell-dmg .input'),
    addDamageButton = document.querySelector('.add-damage');
let selections = {};
selections['saves'] = Array(appOptions.saves.length)
selections['effects'] = Array(appOptions.effects.length)
for (let i=0; i < selections['saves'].length; i++) selections['saves'][i] = 0;
for (let i=0; i < selections['effects'].length; i++) selections['effects'][i] = 0;

let damages = [];


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
function chooseData(dataName, title, callback) {
    const data = appOptions[dataName];
    let screen = document.createElement('DIV');
    screen.className = 'focus-screen';
    screen.onclick = () => {appClientArea.removeChild(appClientArea.lastChild);
        appClientArea.removeChild(appClientArea.lastChild)};
    let select = document.createElement('DIV');
    select.className = 'select-box';
    select.innerHTML = `<div class="title">Select ${title}</div>`
    for (const datum in data){
        if (!data.hasOwnProperty(datum)) continue;
        select.innerHTML +=
            `
                <div id="${data[datum] !== 'None' ? data[datum] : ''}" class="option" onclick="${callback}(this)">${data[datum]}</div>
                `
    }
    appClientArea.appendChild(screen);
    appClientArea.appendChild(select)
}
function selectSchool(selected) {
    schoolInput.innerHTML = selected.id;
    appClientArea.removeChild(appClientArea.lastChild)
    appClientArea.removeChild(appClientArea.lastChild)
}

function selectCastAction(selected) {
    castActionInput.innerHTML = selected.id;
    appClientArea.removeChild(appClientArea.lastChild)
    appClientArea.removeChild(appClientArea.lastChild)
}

function toggleComponent(C, elem) {
    components[C] = !components[C];
    if (components[C]){
        elem.style = "border: #fff solid 1px; color: #fff;"
    } else {
        elem.style = "border: #FFCCBC solid 1px; color: #FFCCBC;"
    }

}

function selectDurationAction(selected) {
    durationActionInput.innerHTML = selected.id;
    appClientArea.removeChild(appClientArea.lastChild)
    appClientArea.removeChild(appClientArea.lastChild)
}

function chooseMData(dataName, title, callback, elem) {
    const data = appOptions[dataName];
    const screen = document.createElement('DIV');
    screen.className = 'focus-screen';
    screen.onclick = () => closeMSelect(elem, closeSelect(dataName));
    let select = document.createElement('DIV');
    select.className = 'select-box';
    select.innerHTML = `<div class="title">Select ${title}</div>`
    for (const datum in data){
        if (!data.hasOwnProperty(datum)) continue;
        select.innerHTML +=
            `
                <div class="option" onclick="mToggle(this, ${datum}, '${dataName}')">${data[datum]}
                <div class="check-holder">${selections[dataName][datum] ? "&check;" : ""}</div>   
                </div>
                `
    }
    select.innerHTML += `<div class="select-done" onclick="${callback}(closeSelect('${dataName}'))">Done</div>`
    appClientArea.appendChild(screen);
    appClientArea.appendChild(select)
}

function mToggle(elem, i, dName) {
    selections[dName][i] ^= 1
    if (selections[dName][i]){
        elem.children[0].innerHTML = "&check;"

    } else {
        elem.children[0].innerHTML = ""
    }
}

function closeMSelect(elem, str){
    elem.innerHTML = str.length ? str.join(', ') : 'None'
}

function closeSaveSelect(str) {
    toHitSaveInput.innerHTML = str.length ? str.join(', ') : 'None'
}

function closeEffectSelect(str) {
    effectInput.innerHTML = str.length ? str.join(', ') : 'None'
}

function closeSelect(dName) {
    let str = []
    for (let i=0; i< selections[dName].length; i++){
        if (selections[dName][i]){
            str.push(appOptions[dName][i])
        }
    }
    appClientArea.removeChild(appClientArea.lastChild)
    appClientArea.removeChild(appClientArea.lastChild)
    return str
}

function addDamage(elem) {
    if (!damages.length){
        addDamageButton.style="margin: 0; position: absolute; right: -18px; bottom: 2px"
        damagesInput.style="height: fit-content; padding-bottom: 25px"
    }
    const newDamage = document.createElement('DIV')
    newDamage.className= 'damage'
    newDamage.id=`D${damages.length}`
    newDamage.innerHTML = '<div class="dice">' +
        '<div class="n-dice" contenteditable="true">1</div>d<div class="dice-num" contenteditable="true">10</div>' +
        `</div><div class="damage-type" onclick="chooseData('damages', 'Damage', selectDamage(this))">psychic damage</div>` +
        '<div class="delete-damage">&#8210;</div>'
    damagesInput.appendChild(newDamage)
    damages.push(newDamage)
}

function selectDamage(elem){
    return ((selected) => {
        elem.innerHTML = selected.id;
        appClientArea.removeChild(appClientArea.lastChild);
        appClientArea.removeChild(appClientArea.lastChild);
    });
}