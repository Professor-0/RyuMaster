
const names = {
  'dex': 'DEXTERITY',
  'str': 'STRENGTH',
  'int': 'INTELLIGENCE',
  'wis': 'WISDOM',
  'con': 'CONSTITUTION',
  'cha': 'CHARISMA'
}

const attributes = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

let skills;
api.fetch('option', 'skills').then(data => skills = data);

function cap(word) {
    if (word.includes(' ')) {
        let words = word.split(' '), i;

        for (i = 0; i < words.length; i++) {
            words[i] = words[i].replaceAt(0, words[i][0].toUpperCase());
        }
        word = words.join(' ')
    } else {
        word = word.replaceAt(0, word[0].toUpperCase())
    }
    return word;
}

function calculate_ac(dex, armour, bonus){
    switch (armour){
        case "padded":
            return bonus + 11 + dex
        case "leather":
            return bonus + 11 + dex
        case "studded":
            return bonus + 12 + dex
        case "hide":
            return dex > 2 ? bonus + 14 : bonus + 12 + dex
        case "chain-shirt":
            return dex > 2 ? bonus + 15 : bonus + 13 + dex
        case "scale":
            return dex > 2 ? bonus + 16 : bonus + 14 + dex
        case "breastplate":
            return dex > 2 ? bonus + 16 : bonus + 14 + dex
        case "half-plate":
            return dex > 2 ? bonus + 17 : bonus + 15 + dex
        case "ring-mail":
            return 14
        case "chain-mail":
            return 16
        case "splint":
            return 17
        case "plate":
            return 18
    }
}

function score_to_mod(score){
    return Math.floor((score - 10) / 2)
}

function mod_to_str(mod) {
    if (mod >= 0) {
        return '+' + mod
    } else {
        return mod.toString()
    }
}

function createScoreBoxes(mods, scores) {


  let boxes = [];
  let box;

  for (const att of attributes) {
    box = document.createElement('DIV');
    box.className = 'score-box';
    box.id = att + "-score";
    box.innerHTML = `
    <div class="score-name">${names[att]}</div>
    <div class="mod">${mod_to_str(mods[att])}</div>
    <div class="score">${scores[att]}</div>
    `;
    boxes.push(box);
  }

  return boxes;
}

function createSaves(mods, char) {

  let saves = [];
  let save;

  for (const att of attributes) {
    save = document.createElement('DIV');
    save.className = "save-att";
    save.id = att + "-save";

    save.innerHTML = `
    <div class="save-att-name">${names[att]}</div>

        <div class="save-att-prof">
        ${char.saves[att].prof > 0 ? `
            <div class="prof-circle"></div>
            ` : ''}
        </div>
        <div class="save-att-mod">
        ${mod_to_str(Math.floor(mods[att] + char.prof * char.saves[att].prof + char.saves[att].bonus))}
        </div>

    `

    saves.push(save);
  }

  return saves;
}

function createSkills(mods, char) {

  let skillBoxes = [];
  let box;

  for (const skill of skills) {
    box = document.createElement('DIV');
    box.className = 'skill';
    box.id = skill.name;

    box.innerHTML = `
    <div class="skill-name">${skill.display}</div>
    <div class="skill-prof">${char.skills[skill.name].prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
    <div class="skill-mod">${mod_to_str(Math.floor(mods[skill.att] + char.prof * char.skills[skill.name].prof + char.skills[skill.name].bonus))}</div>
    `
    skillBoxes.push(box);
  }
  return skillBoxes;
}

function createInfo(char) {

  let race;

  if (char.subrace.length) {
      race = cap(char.subrace + ' ' + char.race)
  } else {
      race = cap(char.race)
  }

  let info = document.createElement('DIV');
  info.className = 'character-info';
  info.innerHTML = `
  <div class="char-name">${char.name}</div>
  <div class="char-details">
      <div class="char-race">${cap(race)}</div>
      <div class="char-class">${cap(char.class)} ${char.level}</div>
  </div>
  `

  return info;
}

function createCharactersheet(char){

  let mods = {}, scores = {};

  for (att of attributes) {
    scores[att] = char[att];
    mods[att] = score_to_mod(char[att]);
  }

  let sheet = document.createElement('DIV');
  sheet.className = 'character-sheet';

  let info = createInfo(char);

  let scoreBoxes = document.createElement('DIV');
  scoreBoxes.className = "scores";

  for (const score of createScoreBoxes(mods, scores)) {
    scoreBoxes.appendChild(score);
  }

  let saves = document.createElement('DIV');
  saves.className = "saves";
  saves.innerHTML = 'SAVING THROWS';

  for (const save of createSaves(mods, char)) {
    saves.appendChild(save);
  }

  let skills = document.createElement('DIV');
  skills.className = "skills";
  skills.innerHTML = 'ABILITIES';

  for (const skill of createSkills(mods, char)) {
    skills.appendChild(skill);
  }

  sheet.appendChild(info);
  sheet.appendChild(scoreBoxes);
  sheet.appendChild(saves);
  sheet.appendChild(skills);

  return sheet;
}

function createTopBar(char) {
  let class_str, race;
  if (char.path !== undefined) {
      class_str = cap(char.class + ' / ' + char.path)
  } else {
      class_str = cap(char.class)
  }
  if (char.subrace.length) {
      race = cap(char.subrace + ' ' + char.race)
  } else {
      race = cap(char.race)
  }
  let topBar = document.createElement('DIV');
  topBar.className = 'top-bar';
  topBar.innerHTML = `
    <div class="name">
       ${char.name}
    </div>
    <div class="col">
        <div class="race">${race}</div>
        <div class="class">${class_str}</div>
    </div>
  `

  return topBar;
}

function createBottomBar(char, mods, scores) {
  let bottomBar = document.createElement('DIV');
  bottomBar.className = 'bottom-bar';
  bottomBar.innerHTML = `
    <div class="ac-lvl-hp">
       <div class="ac">${calculate_ac(score_to_mod(char.dex), char.armour, char.ac.bonus)}</div>
       <div class="lvl">${char.level}</div>
       <div class="hp">${char.hp}</div>
    </div>
  `
  const scoreBoxes = createScoreBoxes(mods, scores);

  let scoresTop = document.createElement('DIV');
  scoresTop.className = 'scores-top';
  for (let i = 0; i < 3; i ++) {
    scoresTop.appendChild(scoreBoxes[i]);
  }

  let scoresBottom = document.createElement('DIV');
  scoresBottom.className = 'scores-bottom';
  for (let i = 3; i < 6; i ++) {
    scoresBottom.appendChild(scoreBoxes[i]);
  }

  bottomBar.appendChild(scoresTop);
  bottomBar.appendChild(scoresBottom);
  return bottomBar;

}

function createControlBoard(i) {
  let board = document.createElement('DIV');
  board.className = 'control-board';

  let view = document.createElement('DIV');
  view.className = 'ctrl-btn';
  view.innerHTML = 'View';
  view.addEventListener('click', () => {
    open_character(i);
  })

  let edit = document.createElement('DIV');
  edit.className = 'ctrl-btn';
  edit.innerHTML = 'Edit';
  edit.addEventListener('click', () => {
    open_character(i);
  })

  let del = document.createElement('DIV');
  del.className = 'ctrl-btn';
  del.innerHTML = 'Delete';
  del.addEventListener('click', () => {
    confirm_delete('character', i);
  })

  board.appendChild(view);
  board.appendChild(edit);
  board.appendChild(del);

  return board;
}

function createCharacterPreview(char, i) {
  let mods = {}, scores = {};

  console.log(i);
  for (att of attributes) {
    scores[att] = char[att];
    mods[att] = score_to_mod(char[att]);
  }

  let preview = document.createElement('DIV');
  preview.className = 'character';
  preview.id = i.toString();

  let left = document.createElement('DIV');
  left.className = 'left';

  left.appendChild(createTopBar(char));
  left.appendChild(createBottomBar(char, mods, scores));

  let right = document.createElement('DIV');
  right.className = 'right';
  right.innerHTML = `
  <div class="right-shade"></div>
  <div class="char-portrait"><img src="${char.portrait}" alt="portrait"/></div>
  `
  let ctrlBoard = createControlBoard(i);

  preview.appendChild(left);
  preview.appendChild(right);
  preview.appendChild(ctrlBoard);

  return preview;
}

async function open_character(index) {
    const char = (await api.fetch('data', 'Characters'))[index];

    appPageHolder.innerHTML = '';
    appPageHolder.appendChild(createCharactersheet(char));
}
