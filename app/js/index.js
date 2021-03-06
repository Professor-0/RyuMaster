const appCloseBtn = document.querySelector('#close'),
    {remote} = require('electron'),
    fs = require('fs'),
    currWindow = remote.getCurrentWindow(),
    appMaxBtn = document.querySelector('#max'),
    appMinBtn = document.querySelector('#min'),
    appMenuBtn = document.querySelector('#open'),
    appSideBar = document.querySelector('#side-bar'),
    appMenu = document.querySelector('#menu'),
    appMenuItems = document.querySelectorAll('.menu-item'),
    appPageHolder = document.querySelector('.page-holder'),
    appClientArea = document.querySelector('.client-area');
appSideBar.style.width = '40px';

let appInnerPage;
let current_page = '', windows = [];

function open_bar() {
    if (appSideBar.style.width === '40px') {
        appMenuBtn.style.display = 'none';
        let width = 40, opacity = 0, id = setInterval(grow, 4);

        function grow() {
            if (width === 200) {
                appMenu.style.opacity = '1';
                appMenu.style.pointerEvents = 'all';
                appSideBar.style.overflowY = 'auto';
                clearInterval(id)
            } else {
                width++;
                appSideBar.style.width = width + 'px';
                if (width > 100) {
                    opacity += 0.02;
                    appMenu.style.opacity = opacity;
                }
            }
        }
    }
}

function close_bar() {
    appSideBar.style.overflowY = 'hidden';
    if (appSideBar.style.width === '200px' && window.outerWidth <= 600) {
        let width = 200, opacity = 1, id = setInterval(shrink, 4);

        function shrink() {
            if (width === 40) {
                appMenu.style.opacity = '0';
                appMenu.style.pointerEvents = 'none';
                appMenuBtn.style.display = 'inherit';
                appSideBar.style.position = 'fixed';
                appPageHolder.style.borderLeft = '40px solid transparent';
                clearInterval(id)
            } else {
                width--;
                appSideBar.style.width = width + 'px';
                opacity -= 0.015;
                appMenu.style.opacity = opacity;
            }
        }
    }
    return 1;
}

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

function confirm_delete(type, index) {
    let data = JSON.parse(fs.readFileSync("app/data/" + type + "s.json").toString());
    let screen = document.createElement('DIV');
    screen.className = 'focus-screen';
    let confirm = document.createElement('DIV');
    confirm.id = 'confirm';
    confirm.className = 'confirm';
    confirm.innerHTML = `
                              <div class="top">Delete ${type}?</div>
                              <div class="body">Are you sure you want to delete ${data[index].name}?</div>
                              <div class="bottom">
                                  <div class="button" onclick="delete_data('${type}', ${index})">Yes</div>
                                  <div class="button" onclick="{appClientArea.removeChild(appClientArea.lastChild);appClientArea.removeChild(appClientArea.lastChild) }">Cancel</div>
                              </div>
                            `;
    appClientArea.appendChild(screen);
    appClientArea.appendChild(confirm);
}

function delete_data(type, index) {
    let data = JSON.parse(fs.readFileSync("app/data/" + type + "s.json").toString());
    data.splice(index, 1);
    fs.writeFile("app/data/" + type + "s.json", JSON.stringify(data), err => {
        if (err) throw err;
        console.log('Deleted Data');
        appClientArea.removeChild(appClientArea.lastChild);
        appClientArea.removeChild(appClientArea.lastChild);
        change_page(type + 's')

    })
}

function load_spells() {
    const spells = JSON.parse(fs.readFileSync("app/data/Spells.json").toString());

    let i = 3, changed = false, current_letter = ' ';
    for (const spell in spells) {
        if (spells.hasOwnProperty(spell)) {
            i++;
            if (appInnerPage.querySelector('#' + spell) === null) {
                if (!spell.startsWith(current_letter)) {
                    current_letter = spell[0];

                    if (appInnerPage.querySelector('#' + current_letter + '-line') === null) {
                        let bar = document.createElement('DIV');
                        bar.className = 'letter-line';
                        bar.id = `${current_letter}-line`;
                        bar.innerHTML = current_letter.toUpperCase();
                        appInnerPage.insertBefore(bar, appInnerPage.children[i])
                    }

                    i++;
                }
                changed = true;
                let elem = document.createElement('DIV');
                elem.className = 'spell-box';
                elem.id = spell;
                elem.innerHTML = `<div class="name">
                                            <div class="text">${spells[spell].name}</div>
                                          </div>`;
                appInnerPage.insertBefore(elem, appInnerPage.children[i])

            }
        }

    }
    if (changed){
        fs.writeFile("app/pages/Spells.html", appPageHolder.innerHTML, err => {
            if (err) throw err;
            console.log('Overwrote Spells')
        })
    }
}

function change_page(page) {
    appPageHolder.innerHTML = fs.readFileSync("app/pages/" + page + ".html").toString();
    current_page = page;
    appInnerPage = document.querySelector('#' + page);
    if (page === 'Characters') {
        const char = JSON.parse(fs.readFileSync("app/data/Characters.json").toString());
        let i, c;
        for (i = 0; i < char.length; i++) {
            c = char[i];
            let class_str, race;
            if (c.path.length) {
                class_str = cap(c.class + ' / ' + c.path)
            } else {
                class_str = cap(c.class)
            }
            if (c.subrace.length) {
                race = cap(c.subrace + ' ' + c.race)
            } else {
                race = cap(c.race)
            }
            appInnerPage.innerHTML +=
                `<div class="character" id="${i}">
                    <div class="left">
                        <div class="top-bar">
                            <div class="name">
                               ${c.name}
                            </div>
                            <div class="col">
                                <div class="race">${race}</div>
                                <div class="class">${class_str}</div>
                            </div>
                        </div>
                        <div class="bottom-bar">
                            <div class="ac-lvl-hp">
                               <div class="ac">${calculate_ac(score_to_mod(c.dex), c.armour, c.ac.bonus)}</div>
                               <div class="lvl">${c.level}</div>
                               <div class="hp">${c.hp}</div>
                            </div>
                            <div class="scores-top">
                                <div id="str-score" class="score-box">
                                    <div class="score-name">STRENGTH</div>
                                    <div class="mod">${mod_to_str(score_to_mod(c.str))}</div>
                                    <div class="score">${c.str}</div>
                                </div>
                                <div id="dex-score" class="score-box">
                                    <div class="score-name">DEXTERITY</div>
                                    <div class="mod">${mod_to_str(score_to_mod(c.dex))}</div>
                                    <div class="score">${c.dex}</div>
                                </div>
                                <div id="con-score" class="score-box">
                                    <div class="score-name">CONSTITUTION</div>
                                    <div class="mod">${mod_to_str(score_to_mod(c.con))}</div>
                                    <div class="score">${c.con}</div>
                                </div>
                            </div>
                            <div class="scores-bottom">
                                <div id="int-score" class="score-box">
                                    <div class="score-name">INTELLIGENCE</div>
                                    <div class="mod">${mod_to_str(score_to_mod(c.int))}</div>
                                    <div class="score">${c.int}</div>
                                </div>
                                <div id="wis-score" class="score-box">
                                    <div class="score-name">WISDOM</div>
                                    <div class="mod">${mod_to_str(score_to_mod(c.wis))}</div>
                                    <div class="score">${c.wis}</div>
                                </div>
                                <div id="cha-score" class="score-box">
                                    <div class="score-name">CHARISMA</div>
                                    <div class="mod">${mod_to_str(score_to_mod(c.cha))}</div>
                                    <div class="score">${c.cha}</div>
                                </div>
                            </div>
                        </div>
                    
                    </div>
                    <div class="right">
                        <div class="char-portrait"><img src="${c.portrait}" alt="portrait"/></div>
                    </div>
                  <div class="control-board">
                       <div class="ctrl-btn" onclick="open_character(${i})">View</div>
                       <div class="ctrl-btn">Edit</div>
                       <div class="ctrl-btn" onclick="confirm_delete('Character', ${i})">Delete</div>
                   </div>
             </div>`;
        }
    } else if (page === 'Races') {
        const races = JSON.parse(fs.readFileSync("app/data/Races.json").toString());
        for (const race in races) {
            if (!races.hasOwnProperty(race)) continue;
            appInnerPage.innerHTML +=
                `
                    <div class="race-box" id="${race}">
                        <div class="name">
                            <div class="text">${race.includes('-') ? cap(race.replaceAll('-', ' ')) : cap(race)}</div>
                        </div>
                    </div>
                    `
        }
    } else if (page === 'Spells') {
        setTimeout(load_spells, 10);
    } else if (page === 'Campaigns'){
        const campaigns = JSON.parse(fs.readFileSync("app/data/Campaigns.json").toString());
        let i, c;
        for (i = 0; i < campaigns.length; i++) {
            c = campaigns[i];
            appInnerPage.innerHTML +=
                `<div class="campaign-box" id="${i}">
                           <div class="name">
                               <div class="text">${c.name}</div>
                           </div>
                           <div class="desc"><div class="text">${c.desc}</div></div>
                           <div class="control-board">
                               <div class="ctrl-btn" onclick="open_campaign(${i})">View</div>
                               <div class="ctrl-btn">Edit</div>
                               <div class="ctrl-btn" onclick="confirm_delete('Campaign', ${i})">Delete</div>
                           </div>
                     </div>`;
        }
    }

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

function open_character(index) {
    const char = JSON.parse(fs.readFileSync("app/data/Characters.json").toString())[index];
    let race, mods = {
        "dex": score_to_mod(char.dex),
        "str": score_to_mod(char.str),
        "con": score_to_mod(char.con),
        "int": score_to_mod(char.int),
        "wis": score_to_mod(char.wis),
        "cha": score_to_mod(char.cha)
    };
    if (char.subrace.length) {
        race = cap(char.subrace + ' ' + char.race)
    } else {
        race = cap(char.race)
    }
    appPageHolder.innerHTML = `
            <div class="character-sheet">
            <div class="character-info">
                <img id="char-png-small" src="../imgs/haruhi.png" alt="Small Portrait of Character"/>
                <div class="char-name">${char.name}</div>
                <div class="char-details">
                    <div class="char-race">${cap(race)}</div>
                    <div class="char-class">${cap(char.class)} ${char.level}</div>
                </div>
            </div>
            <div class="scores">
                <div id="str-score" class="score-box">
                    <div class="score-name">STRENGTH</div>
                    <div class="mod">${mod_to_str(mods.str)}</div>
                    <div class="score">${char.str}</div>
                </div>
                <div id="dex-score" class="score-box">
                    <div class="score-name">DEXTERITY</div>
                    <div class="mod">${mod_to_str(mods.dex)}</div>
                    <div class="score">${char.dex}</div>
                </div>
                <div id="con-score" class="score-box">
                    <div class="score-name">CONSTITUTION</div>
                    <div class="mod">${mod_to_str(mods.con)}</div>
                    <div class="score">${char.con}</div>
                </div>
                <div id="int-score" class="score-box">
                    <div class="score-name">INTELLIGENCE</div>
                    <div class="mod">${mod_to_str(mods.int)}</div>
                    <div class="score">${char.int}</div>
                </div>
                <div id="wis-score" class="score-box">
                    <div class="score-name">WISDOM</div>
                    <div class="mod">${mod_to_str(mods.wis)}</div>
                    <div class="score">${char.wis}</div>
                </div>
                <div id="cha-score" class="score-box">
                    <div class="score-name">CHARISMA</div>
                    <div class="mod">${mod_to_str(mods.cha)}</div>
                    <div class="score">${char.cha}</div>
                </div>
            </div>

            <div class="saves">
                SAVING THROWS
                <div id="str-save" class="save-att">
                    <div class="save-att-name">STRENGTH</div>

                        <div class="save-att-prof">
                        ${char.saves.str.prof > 0 ? `
                            <div class="prof-circle"></div>
                            ` : ''}
                        </div>
                        <div class="save-att-mod">${mod_to_str(Math.floor(mods.str + char.prof * char.saves.str.prof + char.saves.str.bonus))}</div>


                </div>
                <div id="dex-save" class="save-att">
                    <div class="save-att-name">DEXTERITY</div>
                    <div class="save-att-prof">
                        ${char.saves.dex.prof > 0 ? `
                            <div class="prof-circle"></div>
                            ` : ''}</div>
                    <div class="save-att-mod">${mod_to_str(Math.floor(mods.dex + char.prof * char.saves.dex.prof + char.saves.dex.bonus))}</div>
                </div>
                <div id="con-save" class="save-att">
                    <div class="save-att-name">CONSTITUTION</div>
                    <div class="save-att-prof">${char.saves.con.prof > 0 ? `
                            <div class="prof-circle"></div>
                            ` : ''}</div>
                    <div class="save-att-mod">${mod_to_str(Math.floor(mods.con + char.prof * char.saves.con.prof + char.saves.con.bonus))}</div>
                </div>
                <div id="int-save" class="save-att">
                    <div class="save-att-name">INTELLIGENCE</div>
                    <div class="save-att-prof">${char.saves.int.prof > 0 ? `
                            <div class="prof-circle"></div>
                            ` : ''}</div>
                    <div class="save-att-mod">${mod_to_str(Math.floor(mods.int + char.prof * char.saves.int.prof + char.saves.int.bonus))}</div>
                </div>
                <div id="wis-save" class="save-att">
                    <div class="save-att-name">WISDOM</div>
                    <div class="save-att-prof">${char.saves.wis.prof > 0 ? `
                            <div class="prof-circle"></div>
                            ` : ''}</div>
                    <div class="save-att-mod">${mod_to_str(Math.floor(mods.wis + char.prof * char.saves.wis.prof + char.saves.wis.bonus))}</div>
                </div>
                <div id="cha-save" class="save-att">
                    <div class="save-att-name">CHARISMA</div>
                    <div class="save-att-prof">${char.saves.cha.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="save-att-mod">${mod_to_str(Math.floor(mods.cha + char.prof * char.saves.cha.prof + char.saves.cha.bonus))}</div>
                </div>
            </div>
            <div class="skills">
                ABILITIES
                <div id="acrobatics" class="skill">
                    <div class="skill-name">ACROBATICS</div>
                    <div class="skill-prof">${char.skills.acrobatics.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.dex + char.prof * char.skills.acrobatics.prof + char.skills.acrobatics.bonus))}</div>
                </div>
                <div id="animal" class="skill">
                    <div class="skill-name">ANIMAL HANDLING</div>
                    <div class="skill-prof">${char.skills.animal.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.wis + char.prof * char.skills.animal.prof + char.skills.animal.bonus))}</div>
                </div>
                <div id="arcana" class="skill">
                    <div class="skill-name">ARCANA</div>
                    <div class="skill-prof">${char.skills.arcana.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.int + char.prof * char.skills.arcana.prof + char.skills.arcana.bonus))}</div>
                </div>
                <div id="athletics" class="skill">
                    <div class="skill-name">ATHLETICS</div>
                    <div class="skill-prof">${char.skills.animal.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.str + char.prof * char.skills.athletics.prof + char.skills.athletics.bonus))}</div>
                </div>
                <div id="deception" class="skill">
                    <div class="skill-name">DECEPTION</div>
                    <div class="skill-prof">${char.skills.deception.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.cha + char.prof * char.skills.deception.prof + char.skills.deception.bonus))}</div>
                </div>
                <div id="history" class="skill">
                    <div class="skill-name">HISTORY</div>
                    <div class="skill-prof">${char.skills.history.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.int + char.prof * char.skills.history.prof + char.skills.history.bonus))}</div>
                </div>
                <div id="insight" class="skill">
                    <div class="skill-name">INSIGHT</div>
                    <div class="skill-prof">${char.skills.insight.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.wis + char.prof * char.skills.insight.prof + char.skills.insight.bonus))}</div>
                </div>
                <div id="intimidation" class="skill">
                    <div class="skill-name">INTIMIDATION</div>
                    <div class="skill-prof">${char.skills.intimidation.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.cha + char.prof * char.skills.intimidation.prof + char.skills.intimidation.bonus))}</div>
                </div>
                <div id="investigation" class="skill">
                    <div class="skill-name">INVESTIGATION</div>
                    <div class="skill-prof">${char.skills.investigation.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.int + char.prof * char.skills.investigation.prof + char.skills.investigation.bonus))}</div>
                </div>
                <div id="medicine" class="skill">
                    <div class="skill-name">MEDICINE</div>
                    <div class="skill-prof">${char.skills.medicine.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.wis + char.prof * char.skills.medicine.prof + char.skills.medicine.bonus))}</div>
                </div>
                <div id="nature" class="skill">
                    <div class="skill-name">NATURE</div>
                    <div class="skill-prof">${char.skills.nature.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.wis + char.prof * char.skills.nature.prof + char.skills.nature.bonus))}</div>
                </div>
                <div id="perception" class="skill">
                    <div class="skill-name">PERCEPTION</div>
                    <div class="skill-prof">${char.skills.perception.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.wis + char.prof * char.skills.perception.prof + char.skills.perception.bonus))}</div>
                </div>
                <div id="performance" class="skill">
                    <div class="skill-name">PERFORMANCE</div>
                    <div class="skill-prof">${char.skills.performance.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.cha + char.prof * char.skills.performance.prof + char.skills.performance.bonus))}</div>
                </div>
                <div id="persuasion" class="skill">
                    <div class="skill-name">PERSUASION</div>
                    <div class="skill-prof">${char.skills.persuasion.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.cha + char.prof * char.skills.persuasion.prof + char.skills.persuasion.bonus))}</div>
                </div>
                <div id="religion" class="skill">
                    <div class="skill-name">RELIGION</div>
                    <div class="skill-prof">${char.skills.religion.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.int + char.prof * char.skills.religion.prof + char.skills.religion.bonus))}</div>
                </div>
                <div id="sleight" class="skill">
                    <div class="skill-name">SLEIGHT OF HAND</div>
                    <div class="skill-prof">${char.skills.sleight.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.dex + char.prof * char.skills.sleight.prof + char.skills.sleight.bonus))}</div>
                </div>
                <div id="stealth" class="skill">
                    <div class="skill-name">STEALTH</div>
                    <div class="skill-prof">${char.skills.stealth.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.dex + char.prof * char.skills.stealth.prof + char.skills.stealth.bonus))}</div>
                </div>
                <div id="survival" class="skill">
                    <div class="skill-name">SURVIVAL</div>
                    <div class="skill-prof">${char.skills.survival.prof > 0 ? `<div class="prof-circle"></div>` : ''}</div>
                    <div class="skill-mod">${mod_to_str(Math.floor(mods.wis + char.prof * char.skills.survival.prof + char.skills.survival.bonus))}</div>
                </div>
            </div>
            <div class="combat-small">
                <div class="ac">12</div>
                <div class="init">+2</div>
                <div class="speed">30</div>
                <div class="death-saves"></div>
            </div>
        </div>

        `;
}

function open_campaign(index){
    const Campaign = JSON.parse(fs.readFileSync("app/data/Campaigns.json").toString())[index];
    appPageHolder.innerHTML = fs.readFileSync("app/pages/campaign_board.html").toString();
    const appInnerPage = appPageHolder.querySelector('#campaign');
    appInnerPage.innerHTML += `<div class="campaign-title">${Campaign.name}</div>`
}

function scroll_to_letter(letter) {
    let letter_pos = document.querySelector('#' + letter + '-line');
    if (letter_pos === null) {
        let i = 1;
        letter_pos = document.querySelector('#' + String.fromCharCode(letter.charCodeAt(0) - i) + '-line');

        while (letter_pos === null) {
            if (letter.charCodeAt(0) - i === 96) {
                letter_pos = appPageHolder.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
                return
            }
            i++;
            letter_pos = document.querySelector('#' + String.fromCharCode(letter.charCodeAt(0) - i) + '-line');
        }
    }
    letter_pos.scrollIntoView({behavior: "smooth"});
}

function board_fullscreen(){
    appPageHolder.requestFullscreen();

    appPageHolder.onfullscreenchange = () => {
        if (document.fullscreenElement === null){
            appPageHolder.querySelector('.board-fullscreen').style.display = ''
        }
    }
}

function create_new(type){
    let new_win = new remote.BrowserWindow({
        width: 500,
        height: 600,
        minWidth: 500,
        minHeight: 500,
        frame: false,
        icon: __dirname + '\\app\\icons\\haruhi.ico',
        webPreferences: {
            nodeIntegration: true
        }
    });
    new_win.loadFile('app/pages/new_' + type + '.html');
    new_win.webContents.openDevTools()
}


window.onresize = () => {
    if (window.outerWidth > 600) {
        open_bar();
        appSideBar.style.position = 'relative';
        appPageHolder.style.borderLeft = '0'
    } else {
        close_bar();
    }
};
appMenuBtn.addEventListener('click', () => open_bar());
appMenu.addEventListener('mouseleave', () => close_bar());
appMenuItems.forEach(item => {
    item.addEventListener('click', () => change_page(item.innerHTML))
});
if (window.outerWidth > 600) {
    open_bar();
    appSideBar.style.position = 'relative';
    appPageHolder.style.borderLeft = '0'
} else if (window.outerWidth > 350) {
    close_bar();
} else {
    window.resizeTo(350, window.outerHeight)
}
change_page('Characters')