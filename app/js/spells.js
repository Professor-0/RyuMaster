
async function load_spells() {

    const spells = await api.fetch('data', 'Spells');
    for (const letter of document.querySelector(".alphabet-navi").children) {
      letter.addEventListener('click', (event) => {
        scroll_to_letter(event.target.id);
      })
    }
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

                appInnerPage.insertBefore(createSpellBox(spell, spells[spell]), appInnerPage.children[i])

            } else {
              appInnerPage.querySelector('#' + spell + ' .name')
              .addEventListener('click', (event) => {
                toggleSpellPreview(event.path[1])
              });
              appInnerPage.querySelector('#' + spell + ' .toggle-preview')
              .addEventListener('click', (event) => {
                toggleSpellPreview(event.path[1])
              })
            }
        }
    }
    if (changed){
        api.updateSpells(appPageHolder.innerHTML);
    }

}


function createSpellBox(spellName, spell) {
  const spellBox = document.createElement("DIV");
  spellBox.className = "spell-box box";
  spellBox.innerHTML = `
  <div class="name">${spell.name}</div>
  `;
  spellBox.id = spellName;
  spellBox.firstChild.addEventListener('click', (event) => {
    toggleSpellPreview(event.path[1]);
  })

  const togglePreview = document.createElement("DIV");
  togglePreview.className = "toggle-preview";
  togglePreview.innerHTML = "+";
  togglePreview.addEventListener('click', (event) => {
    toggleSpellPreview(event.path[1]);
  })


  spellBox.appendChild(togglePreview);

  return spellBox;
}


async function toggleSpellPreview(parent) {
  if (parent.lastChild.innerHTML === '+') {
    const spell = await api.fetchDatum('Spells', parent.id);

    const previewBox = document.createElement("DIV");
    previewBox.className = "spell-preview box";
    previewBox.innerHTML = `
    <div class="row">
      <div class="casting-info spell-item"><b>Casting Time</b> ${spell.casting_time} <i>${spell.ritual === 'yes' ? 'ritual' : ''}</i></div>
      <div class="components spell-item"><b>Components</b> ${spell.components} (${spell.material ? spell.material : ''})</div>
    </div>
    <div class="row">
      <div class="level spell-item"><b>Level</b> ${spell.level}</div>
      <div class="range spell-item"><b>Range</b> ${spell.range}</div>
    </div>
    <div class="school spell-item"><b>School</b> ${spell.school}</div>
    <div class="description">${spell.desc}</div>
    <div class="description">${spell.higher_level ? spell.higher_level : ''}
    <div class="classes">Requires attunement by a <i>${spell.class.join(", ")}</i></div>
    `;

    parent.lastChild.innerHTML = '-';
    parent.appendChild(previewBox);
  } else {
    parent.removeChild(parent.lastChild);
    parent.lastChild.innerHTML = '+';
  }
}
