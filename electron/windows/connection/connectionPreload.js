const { contextBridge, ipcRenderer } = require('electron')
const os = require('os')

const { prcEnv: env } = require('../../../Common/static')
const { TryConnToServer, } = require('../../../Common/mssql')
const { SendPing } = require("../../../Common/functions")





contextBridge.exposeInMainWorld('connectionWindow', {
    getEnv: () => {
        return {
            ...env
        }
    },
    getLocalIP: () => Object.values(os.networkInterfaces())[0][1].address || 'localhost',
    sendPing: async (ip) =>  await SendPing(ip),
    tryConnToServer: async (config) => await TryConnToServer(config),
    closeCurrentWindow: () => ipcRenderer.send('close_connection_window'),
    saveToEnv: (config) => ipcRenderer.send('save_to_env', JSON.stringify(config)),
    getQueriesList: () => ipcRenderer.invoke('get-queries-list'),
    openQueryEditor: (folderName, fileName) => ipcRenderer.invoke('open-query-editor', folderName, fileName),
});