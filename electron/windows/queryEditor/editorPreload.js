const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const os = require('os');

// BU ÝERDE ESAS MESELE BAR EDI - Iki gezek contextBridge.exposeInMainWorld ulanylýardy
// Indi bir gezek ulanýarys we ähli funksiýalary bir obýektde jemleýäris
contextBridge.exposeInMainWorld('queryEditor', {
  onLoad: (callback) => ipcRenderer.on('load-file-content', (event, data) => callback(data)),
  saveFile: (path, content) => ipcRenderer.invoke('save-query-file', path, content),
  // Default query okamak üçin
  readDefaultQuery: (defaultPath) => ipcRenderer.invoke('read-default-query', defaultPath)
});

// Path we OS funksiýalary üçin aýratyn obýekt
contextBridge.exposeInMainWorld('nodeUtils', {
  pathJoin: (...args) => path.join(...args),
  homeDir: () => os.homedir()
});