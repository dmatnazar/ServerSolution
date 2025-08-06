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
    onLoad: (callback) => ipcRenderer.on('load-file-content', (event, data) => callback(data)),
    saveFile: (path, content) => ipcRenderer.invoke('save-query-file', path, content),
    readDefaultQuery: (defaultPath) => ipcRenderer.invoke('read-default-query', defaultPath),
    getFolders: () => ipcRenderer.invoke('get-folders'),
    copyFolder: (newName) => ipcRenderer.invoke('copy-folder', newName),
    renameFolder: (oldName, newName) => ipcRenderer.invoke('rename-folder', oldName, newName),
    deleteFolder: (name) => ipcRenderer.invoke('delete-folder', name) 
});