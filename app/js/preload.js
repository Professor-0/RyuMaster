const {
    contextBridge,
    ipcRenderer
} = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
      fetch : (channel, name) => {
        let validChannels = ["option", "page", "data"];
        if (typeof name !== 'string' || name.includes('.')) {
          throw new Error("Invalid file name");
        }
        if (!validChannels.includes(channel)) {
          throw new Error("Invalid channel");
        }
        return ipcRenderer.invoke('fetch-' + channel, name);
      },
      fetchDatum : (data, datum) => {
        if (typeof data != 'string' || data.includes('.') ||
            typeof datum != 'string' || datum.includes('.')) {
              throw new Error("Invalid Data or Datum");
        }
        return ipcRenderer.invoke('fetch-datum', {data: data, datum:datum});
      },
      delete : (channel, data) => {
        let validChannels = ["data"];

        if (!data.hasOwnProperty('name') || name.includes('.')) {
          throw new Error("Invalid file name");
        }
        if (!data.hasOwnProperty('index')){
          throw new Error("Index is required");
        }
        if (!validChannels.includes(channel)) {
          throw new Error("Invalid channel");
        }
        ipcRenderer.send('delete-' + channel, data);
      },
      updateSpells : (data) => {
        ipcRenderer.send('update-spells', data);
      },
      createNew : (type) => {
        if (typeof type !== 'string' || type.includes('.')) {
          throw new Error("Invalid type name");
        }
        ipcRenderer.send('create-new', type);
      },
      save : (type, data) => {
        if (typeof type !== 'string' || type.includes('.')) {
          throw new Error("Invalid type name");
        }
        capsule = { type : type, data : data }
        ipcRenderer.send('save', capsule);
      },
      window : {
        main : {
          close : () => {
            ipcRenderer.send('close-main');
          },
          max : () => {
            ipcRenderer.send('max-main');
          },
          min : () => {
            ipcRenderer.send('min-main');
          }
        },
      second : {
        close : () => {
          ipcRenderer.send('close-second');
        },
        max : () => {
          ipcRenderer.send('max-second');
        },
        min : () => {
          ipcRenderer.send('min-second');
        }
      }
      }
    }
  );
