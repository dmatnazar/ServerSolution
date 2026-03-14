const { contextBridge, ipcRenderer } = require("electron")
const path = require("path")
const os = require("os")

contextBridge.exposeInMainWorld("queryEditor", {

  onLoad: (callback) =>
    ipcRenderer.on("load-file-content", (event, data) => callback(data)),

  saveFile: (path, content) =>
    ipcRenderer.invoke("save-query-file", path, content),

  readDefaultQuery: (defaultPath) =>
    ipcRenderer.invoke("read-default-query", defaultPath),

  notify: (title, text, type="info") =>
    ipcRenderer.invoke("notify", { title, text, type })

})

contextBridge.exposeInMainWorld("nodeUtils", {

  pathJoin: (...args) => path.join(...args),
  homeDir: () => os.homedir()

})