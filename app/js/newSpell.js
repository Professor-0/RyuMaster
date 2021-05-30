const appCloseBtn   = document.querySelector('#close'),
      appMaxBtn     = document.querySelector('#max'),
      appMinBtn     = document.querySelector('#min'),
      appClientArea = document.querySelector('.client-area'),
      appPageHolder = document.querySelector('.page-holder'),
      levelInput    = document.querySelector('#spell-level .input'),
      schoolInput   = document.querySelector('#spell-school .input'),
      castActionInput     = document.querySelector('#spell-cast-action .input'),
      durationActionInput = document.querySelector('#spell-duration-action .input'),
      toHitSaveInput      = document.querySelector('#to-hit-save .input'),
      effectInput         = document.querySelector('#effect .input'),
      damagesInput        = document.querySelector('#spell-dmg .input'),
      componentInput      = document.querySelector('#Components .input');
      addDamageButton     = document.querySelector('.add-damage'),
      saveButton          = document.querySelector('.save');



appCloseBtn.addEventListener('click', () => {
  api.window.second.close();
})

appMaxBtn.addEventListener('click', () => {
  api.window.second.max();
})

appMinBtn.addEventListener('click', () => {
  api.window.second.min();
})



let selections = {}, components = [0,0,0];

let appOptions;

let nextDamageId = 1;

String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
};

String.prototype.replaceAll = function (searcher, replacement) {
    let str = '', i = 0;
    for (; i < this.length; i++) {
        if (this[i] === searcher) {
            str += replacement
        } else {
            str += this[i]
        }
    }
    return str
};

function makeNameNice(name) {
  let nice = name.replaceAll(' ', '_');
  nice = nice.toLowerCase();
  return nice;
}

function dmgToStr(dmg) {
  const c = dmg.children;

  return c[1] + 'd' + c[2] + c[3];
}


function save() {
  let name = makeNameNice(document.querySelector('#spell-name .input').innerHTML);
  console.log(damagesInput.children);
  let data = {
    casting_time: document.querySelector('#spell-cast-time .input').innerHTML +
                  ' ' + castActionInput.innerHTML,
    desc: document.querySelector('#spell-desc .input').innerHTML,
    duration: document.querySelector('#spell-duration .input').innerHTML,
    material: document.querySelector('#materials .input').innerHTML,
    name: document.querySelector('#spell-name .input').innerHTML,
    range: document.querySelector('#spell-range-area .input').innerHTML,
    save: toHitSaveInput.innerHTML.split(', '),
    components: components,
    school: schoolInput.innerHTML,
  }
  let dmgs = [];
  for (const d of damagesInput.children) {
    if (d.className === '.damage') {
      dmgs.push(dmgToStr(d));
    }
  }
  if (levelInput.innerHTML === 'Cantrip') {
    data.level = 0;
  } else {
    data.level = parseInt(levelInput.innerHTML);
  }
  let capsule = {};
  capsule[name] = data;
  api.save('Spells', capsule);
}

async function loadOptions() {
  appOptions = await api.fetch('data', 'Options');

  selections['saves'] = Array(appOptions.saves.length);
  selections['effects'] = Array(appOptions.effects.length);

  for (let i=0; i < selections['saves'].length; i++) selections['saves'][i] = 0;

  for (let i=0; i < selections['effects'].length; i++) selections['effects'][i] = 0;
}

loadOptions();

addDamageButton.addEventListener('click', () => {
  addDamage();
})

for (let i = 0; i < 3; ++i) {
  componentInput.children[i].addEventListener('click', () => {
    toggleComponent(i, componentInput.children[i]);
  })
}

toHitSaveInput.addEventListener('click', () => {
  chooseMData('saves', 'To Hit / Save', toHitSaveInput);
})

effectInput.addEventListener('click', () => {
  chooseMData('effects', 'Effect', effectInput)
})

levelInput.addEventListener('click', () => {
  change_level(levelInput);
})

schoolInput.addEventListener('click', () => {
  chooseData('schools', 'School', schoolInput);
})

castActionInput.addEventListener('click', () => {
  chooseData('castActions', 'Cast Action', castActionInput);
})

saveButton.addEventListener('click', () => {
  save();
})

for (let i = 0; i < 3; ++i) {

}

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

    let option;
    for (const datum in data){
        if (!data.hasOwnProperty(datum)) continue;
        option = document.createElement('DIV');
        option.className = "option";
        option.id = data[datum] !== 'None' ? data[datum] : ''
        option.innerHTML = data[datum];
        option.addEventListener('click', () => {
          fillHolder(holder, data[datum]);
        })
        select.appendChild(option);
    }

    appClientArea.appendChild(screen);
    appClientArea.appendChild(select)
}

function fillHolder(holder, selected){
    holder.innerHTML = selected;
    appClientArea.removeChild(appClientArea.lastChild)
    appClientArea.removeChild(appClientArea.lastChild)
}

function toggleComponent(C, elem) {
    components[C] = !components[C];
    if (components[C]){
        elem.style = "color: #fff; background: #e68b5f"
    } else {
        elem.style = "color: #e68b5f; background: none"
    }

}


function chooseMData(dataName, title, elem) {
    const data = appOptions[dataName];

    const screen = document.createElement('DIV');
    screen.className = 'focus-screen';
    screen.addEventListener('click', () => closeMSelect(elem, closeSelect(dataName)));

    let select = document.createElement('DIV');
    select.className = 'select-box';
    select.innerHTML = `<div class="title">Select ${title}</div>`

    const options = [];
    let option;

    for (let i = 0; i < data.length; ++i) {

        option = document.createElement('DIV');
        option.className = 'option';
        option.innerHTML +=
            ` ${data[i]}
            <div class="check-holder">${selections[dataName][i] ? "&check;" : ""}</div>
                `
        select.appendChild(option);

        options.push(option);
        option.addEventListener('click', () => {
          mToggle(options[i], i, dataName);
        })
    }

    option = document.createElement('DIV');
    option.className = 'select-done';
    option.addEventListener('click', () => {
      closeMSelect(elem, closeSelect(dataName));
    })
    option.innerHTML = "Done";

    select.appendChild(option);

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

function closeSelect(dName) {
    let str = []
    for (let i=0; i< selections[dName].length; i++) {
        if (selections[dName][i]) {
            str.push(appOptions[dName][i])
        }
    }
    appClientArea.removeChild(appClientArea.lastChild)
    appClientArea.removeChild(appClientArea.lastChild)
    return str
}

function addDamage() {
    if (!damages.length){
        damagesInput.style="height: fit-content";
    }
    const newDamage = document.createElement('DIV');
    newDamage.className= 'damage';
    newDamage.id = `dmg${nextDamageId}`;

    const damageType = document.createElement('DIV');
    damageType.className = 'damage-type';
    damageType.innerHTML = 'force'
    damageType.addEventListener('click', (event) => {
      console.log(event);
      chooseData('damages', 'Damage Type', event.target)
    })

    const del = document.createElement('DIV');
    del.className = 'delete-damage';
    del.innerHTML = '&#8210;'
    del.addEventListener('click', (event) => {
      deleteDamage(event.path[1]);
    })

    newDamage.innerHTML = `<div class="dice-id">${damages.length+1})</div>` +
        '<div class="dice">' +
        '<div class="n-dice" contenteditable="true">1</div>d<div class="dice-num" contenteditable="true">10</div>' +
        `</div>`

    newDamage.appendChild(damageType);
    newDamage.appendChild(del);

    damagesInput.appendChild(newDamage);
    damagesInput.appendChild(addDamageButton);
    damages.push(newDamage);
    nextDamageId += 1;
}

function deleteDamage(elem) {
    elem.remove();
}
