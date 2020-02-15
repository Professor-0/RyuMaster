const {app, BrowserWindow} = require('electron');

function createWindow() {
    // Create the browser window.
    let win = new BrowserWindow({
        width: 1000,
        height: 600,
        minWidth: 500,
        minHeight: 100,
        frame: false,
        icon: __dirname + '\\app\\icons\\haruhi.ico',
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    win.loadFile('index.html');
    win.webContents.openDevTools();

}

app.setUserTasks([
    {
        program: process.execPath,
        arguments: '--new-window',
        iconPath: process.execPath,
        iconIndex: 0,
        title: 'New Window',
        description: 'Create a new window'
    }
]);

app.on('ready', createWindow);
