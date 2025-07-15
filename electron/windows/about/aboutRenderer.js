let close_btn = document.getElementById('close_btn'),
    server_url = document.getElementById('server_url'),
    db_host = document.getElementById('db_host'),
    db_port = document.getElementById('db_port'),
    db_name = document.getElementById('db_name'),
    app_version_span = document.getElementById('app_version');

let net_connection = document.getElementById('net_connection')






window.addEventListener('DOMContentLoaded', async () => {
    const envObj = window.aboutWindow.getEnv()
    const backendURL = `http://${envObj.backend_address}:${envObj.backend_port}/${envObj.backend_version}`
    if (close_btn) {
        close_btn.addEventListener('click', () => {
            window.aboutWindow.closeAboutWin()
        })
    }

    if (server_url) {
        server_url.addEventListener('click', () => {
            window.aboutWindow.openExternal(backendURL)
        })
    }
  
    server_url.innerText = backendURL
    db_host.innerText = envObj.db_host
    db_port.innerText = envObj.db_port
    db_name.innerText = envObj.db_name
    app_version_span.innerText = window.aboutWindow.appVersion()



})

