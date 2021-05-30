const appCloseBtn   = document.querySelector('#close'),
      appMaxBtn     = document.querySelector('#max'),
      appMinBtn     = document.querySelector('#min'),
      appMenuBtn    = document.querySelector('#open'),
      appSideBar    = document.querySelector('#side-bar'),
      appMenu       = document.querySelector('#menu'),
      appMenuItems  = document.querySelectorAll('.menu-item'),
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

async function confirm_delete(type, index) {
    let data = await api.fetch('data', type + 's');

    let screen = document.createElement('DIV');
    screen.className = 'focus-screen';

    let confirm = document.createElement('DIV');
    confirm.id = 'confirm';
    confirm.className = 'confirm';
    confirm.innerHTML = `
                              <div class="top">Delete ${type}?</div>
                              <div class="body">Are you sure you want to delete ${data[index].name}?</div>
                              <div class="bottom">
                                  <div id="button-confirm" class="button">Yes</div>
                                  <div id="button-cancel"class="button">Cancel</div>
                              </div>
                            `;
    confirm.querySelector('#button-confirm').addEventListener('click', () => {
      delete_data(type, index);
    })
    confirm.querySelector('#button-cancel').addEventListener('click', () => {
      appClientArea.removeChild(appClientArea.lastChild);
      appClientArea.removeChild(appClientArea.lastChild);
    })
    appClientArea.appendChild(screen);
    appClientArea.appendChild(confirm);
}

function delete_data(type, index) {
  api.delete('data', {name : type + 's', index: index});

  appClientArea.removeChild(appClientArea.lastChild);
  appClientArea.removeChild(appClientArea.lastChild);
  change_page(type + 's');
}

function create_board(type) {
  const nameQuery = document.createElement('DIV');
  nameQuery.className = "pop-up";
  nameQuery.innerHTML = `
      Enter name for new ${type}:
  `;

  const queryInput = document.createElement('DIV');
  queryInput.className = "input";

  nameQuery.appendChild(queryInput);
}

function open_new(type) {
  if (type === 'note' || type === 'campaign') {
    create_board(type);
  } else {
    api.createNew(type);
  }
}

async function change_page(page) {
    appPageHolder.innerHTML = await api.fetch('page', page);
    current_page = page;
    appInnerPage = document.querySelector('#' + page);
    document.querySelector(".new-item").addEventListener('click', (event) => {
      open_new(event.target.id);
    });
    let characterElem;
    if (page === 'Characters') {
        const char = await api.fetch('data', 'Characters');
        let i, c;
        for (i = 0; i < char.length; i++) {
          appInnerPage.appendChild(createCharacterPreview(char[i], i));
        }
    } else if (page === 'Races') {
        const races = await api.fetch('data', 'Races');
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
        const campaigns = await api.fetch('data', 'Campaigns')
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



async function open_campaign(index){
    const Campaign = (await api.fetch('data', 'Campaigns'))[index];
    appPageHolder.innerHTML = await api.fetch('page', 'campaign_board');
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

appCloseBtn.addEventListener('click', () => {
  api.window.main.close();
})

appMaxBtn.addEventListener('click', () => {
  api.window.main.max();
})

appMinBtn.addEventListener('click', () => {
  api.window.main.min();
})

if (window.outerWidth > 600) {
    open_bar();
    appSideBar.style.position = 'relative';
    appPageHolder.style.borderLeft = '0';
} else if (window.outerWidth > 350) {
    close_bar();
} else {
    window.resizeTo(350, window.outerHeight)
}

change_page('Spells')
