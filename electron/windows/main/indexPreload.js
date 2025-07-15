const { contextBridge, ipcRenderer } = require('electron')



contextBridge.exposeInMainWorld('indexWindow', {
    restartApp: () => ipcRenderer.send('restart_app')
})