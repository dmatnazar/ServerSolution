let backend_address = document.getElementById('backend_address'),
    backend_port = document.getElementById('backend_port'),
    backend_version = document.getElementById('backend_version'),

    db_host = document.getElementById('db_host'),
    db_port = document.getElementById('db_port'),
    db_name = document.getElementById('db_name'),
    db_username = document.getElementById('db_username'),
    db_password = document.getElementById('db_password'),

    backend_refresh_btn = document.getElementById('backend_refresh_btn'),
    db_refresh_btn = document.getElementById('db_refresh_btn'),

    backend_settings_err_msg = document.getElementById('backend_settings_err_msg'),
    db_settings_err_msg = document.getElementById('db_settings_err_msg'),

    backend_refresh_icon = document.getElementById('backend_refresh_icon'),
    backend_checked_icon = document.getElementById('backend_checked_icon'),

    db_refresh_icon = document.getElementById('db_refresh_icon'),
    db_checked_icon = document.getElementById('db_checked_icon'),
    db_error_icon = document.getElementById('db_error_icon'),


    db_test_conn = document.getElementById('db_test_conn'),

    db_test_conn_icon = document.getElementById('db_test_conn_icon'),

    cancel_btn = document.getElementById('cancel_btn'),
    save_btn = document.getElementById('save_btn'),

    db_test_conn_text = document.getElementById('db_test_conn_text'),
    db_test_conn_err_icon = document.getElementById('db_test_conn_err_icon');



const env = window.connectionWindow.getEnv()

function validatePort(port) {
    return Number.isInteger(port) && port >= 0 && port <= 65535;
}
const tabsWrapper = document.querySelector('.tabs');
const addTabBtn = document.getElementById('add_tab');
const tabInputWrapper = document.getElementById('tab_input_wrapper');
const newTabInput = document.getElementById('new_tab_input');
const createTabBtn = document.getElementById('create_tab_btn');

function createTab(name) {
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.textContent = name;
    tabsWrapper.insertBefore(btn, addTabBtn);
}

async function loadTabsFromFolders() {
    const folders = await window.connectionWindow.getFolders();
    const filtered = folders.filter(f => f.startsWith('ServerSolution'));
    const names = filtered.map(f => f.replace('ServerSolution', '') || 'Default');

    // Remove previously inserted dynamic tabs (optional cleanup)
    document.querySelectorAll('.tab.dynamic-tab')?.forEach(e => e.remove());

    for (let name of names) {
        const btn = document.createElement('button');
        btn.className = 'tab dynamic-tab';
        btn.textContent = name;
        tabsWrapper.insertBefore(btn, addTabBtn);
    }
}

// "+" basylanda input görkezel
addTabBtn.addEventListener('click', () => {
    tabInputWrapper.style.display = 'inline-block';
    newTabInput.focus();
});

// "Create" basylanda täze papka döreder we täze tab goşar
createTabBtn.addEventListener('click', async () => {
    const name = newTabInput.value.trim();
    if (!name) return;

    try {
        await window.connectionWindow.copyFolder(name);
        createTab(name);
        newTabInput.value = '';
        tabInputWrapper.style.display = 'none';
    } catch (err) {
        console.error('Failed to create folder:', err);
    }
});

window.addEventListener('DOMContentLoaded', async () => {
    backend_address.value = env.backend_address
    backend_port.value = env.backend_port
    backend_version.value = env.backend_version

    db_host.value = env.db_host
    db_port.value = env.db_port
    db_name.value = env.db_name
    db_username.value = env.db_username
    db_password.value = env.db_password




    if (backend_refresh_btn) {
        backend_refresh_btn.addEventListener('click', BackendRefreshFunction)
    }

    if (db_refresh_btn) {
        db_refresh_btn.addEventListener('click', DatabaseRefreshFunction)
    }



    if (db_test_conn) {
        db_test_conn.addEventListener('click', DatabaseTestConn)
    }


    if (cancel_btn) {
        cancel_btn.addEventListener('click', () => {
            window.connectionWindow.closeCurrentWindow()
        })
    }


    if (save_btn) {
        save_btn.addEventListener('click', async () => {
            // BackendRefreshFunction()
            const db_refresh_res = await DatabaseRefreshFunction()
            const db_res = await DatabaseTestConn()
            console.log("🚀 ~ save_btn.addEventListener ~ db_res:", db_res)
           
            if (!validatePort(Number(backend_port.value))) {
                backend_port.focus()
                backend_settings_err_msg.innerText = 'Invalid backend port'
            } else if (!validateVersion(backend_version.value)) {
                backend_version.focus()
                backend_settings_err_msg.innerText = 'Invalid backend version. ex: v1'
            }
            if (db_refresh_res && db_res   && validatePort(Number(backend_port.value)) && validateVersion(backend_version.value)) {
                const config = {
                    backend_address: backend_address.value,
                    backend_port: backend_port.value,
                    backend_version: backend_version.value,

                    db_host: db_host.value,
                    db_port: db_port.value,
                    db_name: db_name.value,
                    db_username: db_username.value,
                    db_password: db_password.value,
                }
                window.connectionWindow.saveToEnv(config)
            }
            setTimeout(() => {
                backend_settings_err_msg.innerText = ''
            }, 3000)
        })
    }

})





function BackendRefreshFunction() {
    let localIP = window.connectionWindow.getLocalIP()
    backend_address.value = localIP
    backend_refresh_icon.style.display = 'none'
    backend_checked_icon.style.display = 'block'
    setTimeout(() => {
        backend_refresh_icon.style.display = 'block'
        backend_checked_icon.style.display = 'none'
    }, 3000)
}

async function DatabaseRefreshFunction() {
    let res = false
    let { alive } = await window.connectionWindow.sendPing(db_host.value)
    if (alive) {
        db_refresh_icon.style.display = 'none'
        db_checked_icon.style.display = 'block'
        db_refresh_icon.style.animation = 'spin .5s linear infinite'
        res = true
        setTimeout(() => {
            db_refresh_icon.style.display = 'block'
            db_checked_icon.style.display = 'none'
            db_refresh_icon.style.animation = 'none'
        }, 3000)
    } else {
        db_refresh_icon.style.display = 'none'
        db_error_icon.style.display = 'block'
        setTimeout(() => {
            db_refresh_icon.style.display = 'block'
            db_error_icon.style.display = 'none'
        }, 3000)
    }
    return res
}



async function DatabaseTestConn() {
    let res = false
    const config = {
        user: db_username.value,
        password: db_password.value,
        database: db_name.value,
        server: db_host.value,
        port: db_port.value,
    }
    await DatabaseRefreshFunction()
    let { alive } = await window.connectionWindow.sendPing(db_host.value)
    if (!alive) {
        db_settings_err_msg.innerText = 'Invalid database host'
        db_host.focus()
    } else if (!validatePort(Number(db_port.value))) {
        db_settings_err_msg.innerText = 'Invalid port'
        db_port.focus()
    } else if (db_name.value.length > 50 || db_name.value.length === 0) {
        db_settings_err_msg.innerText = 'Invalid database name'
        db_name.focus()
    } else if (db_username.value.length > 50 || db_username.value.length === 0) {
        db_settings_err_msg.innerText = 'Invalid username'
        db_username.focus()
    } else if (db_username.value.length === 0) {
        db_settings_err_msg.innerText = 'Password cannot be empty'
        db_password.focus()
    } else {
        db_test_conn_text.style.display = 'none'
        db_test_conn_icon.style.display = 'block'
        const conn_result = await window.connectionWindow.tryConnToServer(config)
        if (conn_result.status === 200) {
            db_test_conn_text.style.display = 'block'
            db_test_conn_text.innerText = 'Successfully'
            db_test_conn_text.style.color = '#90EE90'
            db_test_conn_icon.style.display = 'none'
            res = true
        } else {
            db_test_conn_icon.style.display = 'none'
            db_test_conn_err_icon.style.display = 'block'
        }

        setTimeout(() => {
            db_test_conn_err_icon.style.display = 'none'
            db_test_conn_text.innerText = 'Test connection'
            db_test_conn_text.style.display = 'block'
            db_test_conn_text.style.color = 'whitesmoke'
        }, 3000);
    }
    setTimeout(() => {
        db_settings_err_msg.innerText = ''
    }, 3000)
    return res
}

async function loadQueriesList() {
    const result = await window.connectionWindow.getQueriesList();
    const container = document.querySelector('.query_editor');

    result.forEach(folder => {
        const folderDiv = document.createElement('div');
        folderDiv.innerHTML = `<h3>${folder.folderName}</h3>`;
        
        folder.files.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.textContent = file;
            fileDiv.style.cursor = 'pointer';
            fileDiv.onclick = () => openEditor(folder.folderName, file);
            folderDiv.appendChild(fileDiv);
        });

        container.appendChild(folderDiv);
    });
}

function openEditor(folderName, fileName) {
    window.connectionWindow.openQueryEditor(folderName, fileName); // IPC arkaly aç
}

window.onload = loadQueriesList;



function validateVersion(input) {
    var regex = /^v\d+$/;
    if (regex.test(input)) {
        return true
    } else {
        return false
    }
}