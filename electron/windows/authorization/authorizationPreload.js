const { contextBridge, ipcRenderer } = require('electron')
const {  prcEnv: env } = require('../../../Common/static')

let receivedData = 'initial';
ipcRenderer.on('window_name_channel', (event, arg) => {
    receivedData = arg
})






contextBridge.exposeInMainWorld('authWindow', {
    getAdminPass: () => env.admin_pass,
    authSuccessfully: (windowName) => ipcRenderer.send('auth_successfully_passed', windowName),
    getWindowName: () => getData(),
    openAboutWindow: () => ipcRenderer.send('open_about_window'),
    openRegisterWindow: () => ipcRenderer.send('open_register_window'),
    openConnectionWindow: () => ipcRenderer.send('open_connection_window'),

})

function getData() {
    return receivedData
}