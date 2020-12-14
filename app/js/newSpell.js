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

function chooseData(dataName, title, holder) {
    const data = appOptions[dataName];
    let screen = document.createElement('DIV');
    screen.className = 'focus-screen';
    screen.onclick = () => {appClientArea.removeChild(appClientArea.lastChild);
        appClientArea.removeChild(appClientArea.lastChild)};
    let select = document.createElement('DIV');
    select.className = 'select-box';
    select.innerHTML = `<div class="title">Select ${title}</div>`;
    for (const datum in data){
        if (!data.hasOwnProperty(datum)) continue;
        select.innerHTML +=
            `
                <div id="${data[datum] !== 'None' ? data[datum] : ''}" class="option" onclick="fillHolder(${holder}, this)">${data[datum]}</div>
                `
    }
    appClientArea.appendChild(screen);
    appClientArea.appendChild(select)
}

function fillHolder(holder, selected){
    holder.innerHTML = selected.id;
    appClientArea.removeChild(appClientArea.lastChild)
    appClientArea.removeChild(appClientArea.lastChild)
}

function toggleComponent(C, elem) {
    components[C] = !components[C];
    if (components[C]){
        elem.style = "border: #fff solid 1px; color: #fff;"
    } else {
        elem.style = "border: #2384a0 solid 1px; color: #2384a0;"
    }

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
        damagesInput.style="height: fit-content"
    }
    const newDamage = document.createElement('DIV')
    newDamage.className= 'damage'
    newDamage.innerHTML = `<div class="dice-id">${damages.length+1})</div>` +
        '<div class="dice">' +
        '<div class="n-dice" contenteditable="true">1</div>d<div class="dice-num" contenteditable="true">10</div>' +
        `</div><div class="damage-type" onclick="chooseData('damages', 'Damage', 'damages[${damages.length}].children[2]')">psychic</div> damage` +
        `<div class="delete-damage" onclick="deleteDamage(${damages.length})">&#8210;</div>`
    damagesInput.appendChild(newDamage)
    damagesInput.appendChild(addDamageButton)
    damages.push(newDamage)
}

function deleteDamage(id){
    damages[id].remove();
    for (let i = id + 1; i < damages.length; ++i){
        damages[i].children[0].innerHTML = i + ")";
        damages[i].children[2].onclick = () =>
            chooseData('damages', 'Damage', `damages[${i - 1}].children[2]`);
        damages[i].children[3].onclick = () =>
            deleteDamage(i - 1);
    }
    damages.splice(id, 1);

}