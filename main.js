const {
  app,
  BrowserWindow,
  ipcMain,
  session
} = require('electron');

const fs = require('fs').promises;
const path = require('path');

const appPath = path.join(__dirname, 'app');

let mainWindow;

let secondWindow;

let options;

function setCSP() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; script-src 'self' devtools: 'unsafe-eval'; style-src 'self' devtools: 'unsafe-inline'"]
      }
    })
  });

}

function createMainWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 500,
    minHeight: 500,
    frame: false,
    icon: path.join(appPath, 'imgs', 'haruhi.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(appPath, 'js', 'preload.js')
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

}

app.whenReady().then(() => {
  createMainWindow()
  setCSP()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('fetch-option', async (event, optionName) => {

    if (options === undefined){
      options = await fs.readFile(path.join(appPath, 'data', 'Options.json'),
                'utf8');

      options = JSON.parse(options);
    }

    return options[optionName];
})

ipcMain.handle('fetch-page', async (event, pageName) => {
  let page = await fs.readFile(path.join(appPath, 'pages', pageName + '.html'),
   'utf8');

  return page;
})

ipcMain.handle('fetch-data', async (event, dataName) => {
  let data = await fs.readFile(path.join(appPath, 'data', dataName + '.json'),
   'utf8');

  data = JSON.parse(data);

  return data;
})

ipcMain.on('delete-data', async (event, deletion) => {
  let data = await fs.readFile(path.join(appPath, 'data', deletion.name + '.json'), 'utf8');

  data = JSON.parse(data);
  data.splice(deletion.index, 1);

  fs.writeFile(path.join(appPath, 'data', deletion.name + '.json'),
               JSON.stringify(data));
})

ipcMain.on('close-main', (event) => {
  mainWindow.close();
})

ipcMain.on('max-main', (event) => {
  if (mainWindow.isMaximized()) {
    mainWindow.restore()
  } else {
    mainWindow.maximize();
  }
})

ipcMain.on('min-main', (event) => {
  mainWindow.minimize();
})

ipcMain.on('close-second', (event) => {
  secondWindow.close();
})

ipcMain.on('max-second', (event) => {
  if (secondWindow.isMaximized()) {
    secondWindow.restore()
  } else {
    secondWindow.maximize();
  }
})

ipcMain.on('min-second', (event) => {
  secondWindow.minimize();
})

ipcMain.on('update-spells', (event, data) => {
  fs.writeFile(path.join(appPath, 'pages', 'Spells.html'), data);
})

ipcMain.on('create-new', (event, type) => {
  secondWindow = new BrowserWindow({
      width: 500,
      height: 600,
      minWidth: 500,
      minHeight: 500,
      frame: false,
      icon: path.join(appPath, 'imgs', 'haruhi.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(appPath, 'js', 'preload.js')
      }
  });
  secondWindow.loadFile('app/pages/new_' + type + '.html');
  secondWindow.webContents.openDevTools()
})

ipcMain.on('save', async (event, data) => {
  let file = await fs.readFile(path.join(appPath, 'data', data.type + '.json'), 'utf8');

  file =  JSON.parse(file);

  if (file.push === undefined) {
    console.log(data.data);
    for (const key of Object.keys(data.data)) {
      file[key] = data.data[key];
    }
  } else {
    file.push(data.data);
  }

  fs.writeFile(path.join(appPath, 'data', data.type + '.json'), JSON.stringify(file));

})
