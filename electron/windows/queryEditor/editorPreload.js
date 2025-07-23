const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('queryEditor', {
  onLoad: (callback) => ipcRenderer.on('load-file-content', (event, data) => callback(data)),
  saveFile: (path, content) => ipcRenderer.invoke('save-query-file', path, content),
  // Täze goşulan funksiýa - default query okamak üçin
  readDefaultQuery: (defaultPath) => ipcRenderer.invoke('read-default-query', defaultPath)
});