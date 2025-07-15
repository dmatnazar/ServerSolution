const { contextBridge, ipcRenderer, shell } = require('electron')
const { prcEnv: env } = require('../../../Common/static')



contextBridge.exposeInMainWorld('aboutWindow', {
    closeAboutWin: () => ipcRenderer.send('close_about_win'),
    openExternal: (url) => shell.openExternal(url),
    getEnv: () => {
        return {
            ...env
        }
    },
    appVersion: () => {
        return ipcRenderer.sendSync('get-version');
    },
    restartApp: () => ipcRenderer.send('restart_app')
})