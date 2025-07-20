const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('authWindow', {
    getWindowName: () => {
        return ipcRenderer.invoke('get-window-name')
    },
    getAdminPass: () => {
        return ipcRenderer.invoke('get-admin-pass')
    },
    openAboutWindow: () => {
        ipcRenderer.send('open-about-window')
    },
    openConnectionWindow: () => {
        ipcRenderer.send('open-connection-window')
    }
})
