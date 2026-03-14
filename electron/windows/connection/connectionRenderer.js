function validatePort(port) {
    return Number.isInteger(port) && port >= 0 && port <= 65535;
}
function showRenameModal(currentName) {
  if (!currentName) {
    alert("No tab selected to rename.");
    return;
  }
  selectedTabName = currentName; // 🆕 name overwrite etmek üçin
  renameInput.value = currentName;
  renameModal.style.display = 'flex';
  renameInput.focus();
}

function validateVersion(input) {
    return /^v\d+$/.test(input);
}

let selectedTabName = null;
let contextMenu = document.getElementById('tab_context_menu');

let tabsContainer;
let addTabBtn;

// ✅ Rename modal elementleri
let renameModal;
let renameInput;
let renameConfirmBtn;
let renameCancelBtn;
function createTab(name) {
    const tab = document.createElement('button');
    tab.className = 'tab dynamic-tab';
    tab.textContent = name;

    if (tabsContainer && tabsContainer.contains(addTabBtn)) {
        tabsContainer.insertBefore(tab, addTabBtn);
    } else if (tabsContainer) {
        tabsContainer.appendChild(tab);
    } else {
        console.error("tabsContainer not defined or not found in DOM");
    }
    tab.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        selectedTabName = name;
        showContextMenu(e.pageX, e.pageY);
    });
}
contextMenu.addEventListener('click', async (e) => {
  if (!e.target.classList.contains('context-option')) return;

  const action = e.target.dataset.action;

  if (!selectedTabName || selectedTabName === '+') return;

  switch (action) {
    case 'duplicate':
      const duplicateName = selectedTabName + '_Copy';
      await window.connectionWindow.copyFolder(duplicateName);
      createTab(duplicateName);
      break;

    case 'rename':
      showRenameModal(selectedTabName);
      break;

    case 'delete':
      const confirmDelete = confirm(`Delete "${selectedTabName}" tab?`);
      if (confirmDelete) {
        await window.connectionWindow.deleteFolder(selectedTabName);
        await loadTabsFromFolders();
      }
      break;
  }

  hideContextMenu();
});


async function loadTabsFromFolders() {
    const folders = await window.connectionWindow.getFolders();
    const filtered = folders.filter(f => f.startsWith('ServerSolution'));
    const names = filtered.map(f => f.replace('ServerSolution', '') || 'Default');

    document.querySelectorAll('.tab.dynamic-tab')?.forEach(e => e.remove());

    names.forEach(name => createTab(name));
}

function showContextMenu(x, y) {
  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
  contextMenu.style.display = 'block';
}

function hideContextMenu() {
  contextMenu.style.display = 'none';
}

// Any click outside menu → hide
document.addEventListener('click', (e) => {
  if (!contextMenu.contains(e.target)) {
    hideContextMenu();
  }
});
//add_tab input //
document.getElementById('add_tab').addEventListener('click', () => {
  document.getElementById('tab-input-overlay').style.display = 'flex';
  document.getElementById('new_tab_input').value = '';
});

document.getElementById('cancel_tab_btn').addEventListener('click', () => {
  document.getElementById('tab-input-overlay').style.display = 'none';
});

async function DatabaseRefreshFunction(db_host, db_refresh_icon, db_checked_icon, db_error_icon) {
    let res = false;
    let { alive } = await window.connectionWindow.sendPing(db_host.value);
    if (alive) {
        db_refresh_icon.style.display = 'none';
        db_checked_icon.style.display = 'block';
        db_refresh_icon.style.animation = 'spin .5s linear infinite';
        res = true;
        setTimeout(() => {
            db_refresh_icon.style.display = 'block';
            db_checked_icon.style.display = 'none';
            db_refresh_icon.style.animation = 'none';
        }, 3000);
    } else {
        db_refresh_icon.style.display = 'none';
        db_error_icon.style.display = 'block';
        setTimeout(() => {
            db_refresh_icon.style.display = 'block';
            db_error_icon.style.display = 'none';
        }, 3000);
    }
    return res;
}

async function DatabaseTestConn(db_host, db_port, db_name, db_username, db_password, db_settings_err_msg, db_test_conn_text, db_test_conn_icon, db_test_conn_err_icon) {
    let res = false;
    const config = {
        user: db_username.value,
        password: db_password.value,
        database: db_name.value,
        server: db_host.value,
        port: db_port.value,
    };

    await DatabaseRefreshFunction(db_host, db_refresh_icon, db_checked_icon, db_error_icon);

    let { alive } = await window.connectionWindow.sendPing(db_host.value);
    if (!alive) {
        db_settings_err_msg.innerText = 'Invalid database host';
        db_host.focus();
    } else if (!validatePort(Number(db_port.value))) {
        db_settings_err_msg.innerText = 'Invalid port';
        db_port.focus();
    } else if (db_name.value.length > 50 || db_name.value.length === 0) {
        db_settings_err_msg.innerText = 'Invalid database name';
        db_name.focus();
    } else if (db_username.value.length > 50 || db_username.value.length === 0) {
        db_settings_err_msg.innerText = 'Invalid username';
        db_username.focus();
    } else if (db_password.value.length === 0) {
        db_settings_err_msg.innerText = 'Password cannot be empty';
        db_password.focus();
    } else {
        db_test_conn_text.style.display = 'none';
        db_test_conn_icon.style.display = 'block';
        const conn_result = await window.connectionWindow.tryConnToServer(config);
        if (conn_result.status === 200) {
            db_test_conn_text.style.display = 'block';
            db_test_conn_text.innerText = 'Successfully';
            db_test_conn_text.style.color = 'rgb(255, 255, 255)';
            db_test_conn_icon.style.display = 'none';
            res = true;
        } else {
            db_test_conn_icon.style.display = 'none';
            db_test_conn_err_icon.style.display = 'block';
        }

        setTimeout(() => {
            db_test_conn_err_icon.style.display = 'none';
            db_test_conn_text.innerText = 'Test connection';
            db_test_conn_text.style.display = 'block';
            db_test_conn_text.style.color = 'whitesmoke';
        }, 3000);
    }

    setTimeout(() => {
        db_settings_err_msg.innerText = '';
    }, 3000);

    return res;
}

function BackendRefreshFunction(backend_address, backend_refresh_icon, backend_checked_icon) {
    let localIP = window.connectionWindow.getLocalIP();
    backend_address.value = localIP;
    backend_refresh_icon.style.display = 'none';
    backend_checked_icon.style.display = 'block';
    setTimeout(() => {
        backend_refresh_icon.style.display = 'block';
        backend_checked_icon.style.display = 'none';
    }, 3000);
}

async function loadQueriesList() {
    const result = await window.connectionWindow.getQueriesList();
    const container = document.querySelector('.query_editor');

    // Konteýneri arassalamak we header bilen gözleg meýdançasyny goşmak
    container.innerHTML = `
        <h1 class="query-editor__title">list of queries</h1>
        <input type="text" class="query-editor__search" placeholder="Papka ýa-da faýl ady boýunça gözläň...">
        <div class="query-editor__content"></div>
    `;

    const contentContainer = container.querySelector('.query-editor__content');
    const searchInput = container.querySelector('.query-editor__search');

    // Asyl folderlaryň nusgasyny saklamak
    const originalFolders = result;

    function renderFolder(folder, parentDiv, depth = 0) {
        const folderDiv = document.createElement('div');
        folderDiv.className = `folder folder--depth-${depth}`;
        folderDiv.innerHTML = `
            <div class="folder__header">
                <span class="folder__icon">📁</span>
                <h5 class="folder__name">${folder.folderName}</h5>
            </div>
        `;

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'folder__items';

        // Faýllary render etmek
        folder.files.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'file';
            fileDiv.innerHTML = `
                <span class="file__icon">📄</span>
                <span class="file__name">${file}</span>
            `;
            fileDiv.title = `${file} aç`;
            fileDiv.onclick = () => openEditor(folder.fullPath, file);
            // console.log('filePath:', folder.fullPath, 'fileName:', file);
            itemsContainer.appendChild(fileDiv);
        });

        // Subfolderlary render etmek
        folder.subFolders.forEach(sub => renderFolder(sub, itemsContainer, depth + 1));
        folderDiv.appendChild(itemsContainer);
        parentDiv.appendChild(folderDiv);
    }

    // Gözleg funksiýasy
    function filterAndRender() {
        const searchTerm = searchInput.value.toLowerCase();
        contentContainer.innerHTML = ''; // Konteýneri arassalaýarys

        // Filtrlenen folderlary we faýllary render etmek
        originalFolders.forEach(folder => {
            const filteredFolder = {
                folderName: folder.folderName,
                fullPath: folder.fullPath,
                files: folder.files.filter(file => file.toLowerCase().includes(searchTerm)),
                subFolders: folder.subFolders
                    .map(sub => ({
                        ...sub,
                        files: sub.files.filter(file => file.toLowerCase().includes(searchTerm)),
                        subFolders: sub.subFolders // Rekursiw filtrleme üçin
                    }))
                    .filter(sub => sub.files.length > 0 || sub.subFolders.length > 0 || sub.folderName.toLowerCase().includes(searchTerm))
            };

            // Eger folderde faýl ýa-da subfolder bar bolsa ýa-da folder ady gözlege gabat gelse, render et
            if (filteredFolder.files.length > 0 || filteredFolder.subFolders.length > 0 || filteredFolder.folderName.toLowerCase().includes(searchTerm)) {
                renderFolder(filteredFolder, contentContainer);
            }
        });
    }

    // Ilki bilen ähli folderlary render et
    filterAndRender();

    // Gözleg meýdançasyna event listener goşmak
    searchInput.addEventListener('input', filterAndRender);
}

function openEditor(folderName, fileName) {
    window.connectionWindow.openQueryEditor(folderName, fileName);
}

window.addEventListener('DOMContentLoaded', async () => {
    // 🔧 Bu ýerde öň globalda bellän üýtgeýjilere DOM-dan elementleri al
    tabsContainer = document.getElementById('tabs_container');
    addTabBtn = document.getElementById('add_tab');

    // 🔧 Bu ýerde beýleki diňe lokal ulanyljak üýtgeýjiler (const bilen) ýazylýar:
    const backend_address = document.getElementById('backend_address'),
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
        db_test_conn_text = document.getElementById('db_test_conn_text'),
        db_test_conn_err_icon = document.getElementById('db_test_conn_err_icon'),

        cancel_btn = document.getElementById('cancel_btn'),
        save_btn = document.getElementById('save_btn'),

        tabInputWrapper = document.getElementById('tab_input_wrapper'),
        newTabInput = document.getElementById('new_tab_input'),
        createTabBtn = document.getElementById('create_tab_btn');

        renameModal = document.getElementById('rename_modal');
        renameInput = document.getElementById('rename_input');
        renameConfirmBtn = document.getElementById('rename_confirm_btn');
        renameCancelBtn = document.getElementById('rename_cancel_btn');

        let contextMenu = document.getElementById('tab_context_menu');

    // 🌱 Env-den gelen maglumatlary input-lara ýaz
    const env = window.connectionWindow.getEnv();
    backend_address.value = env.backend_address;
    backend_port.value = env.backend_port;
    backend_version.value = env.backend_version;

    db_host.value = env.db_host;
    db_port.value = env.db_port;
    db_name.value = env.db_name;
    db_username.value = env.db_username;
    db_password.value = env.db_password;

    // 🔁 Tabs and Queries load
    await loadTabsFromFolders();
    await loadQueriesList();

    // ➕ "+" tab basylanda input açylýar
    addTabBtn.addEventListener('click', () => {
        tabInputWrapper.style.display = 'inline-block';
        newTabInput.focus();
    });

    // ➕ Täze tab döretmek
    createTabBtn.addEventListener('click', async () => {
        const name = newTabInput.value.trim();
        if (!name) return;
        document.getElementById('tab-input-overlay').style.display = 'none';

        try {
            await window.connectionWindow.copyFolder(name);
            createTab(name);
            newTabInput.value = '';
            tabInputWrapper.style.display = 'none';
        } catch (err) {
            console.error('Failed to create folder:', err);
        }
    });

    // 🔄 Refresh we Test düwmeler
    backend_refresh_btn?.addEventListener('click', () =>
        BackendRefreshFunction(backend_address, backend_refresh_icon, backend_checked_icon)
    );

    db_refresh_btn?.addEventListener('click', () =>
        DatabaseRefreshFunction(db_host, db_refresh_icon, db_checked_icon, db_error_icon)
    );

    db_test_conn?.addEventListener('click', () =>
        DatabaseTestConn(
            db_host, db_port, db_name, db_username, db_password,
            db_settings_err_msg, db_test_conn_text, db_test_conn_icon, db_test_conn_err_icon
        )
    );

    // ❌ Cancel
    cancel_btn?.addEventListener('click', () => {
        window.connectionWindow.closeCurrentWindow();
    });
    // ❌ Rename modal
    renameCancelBtn.addEventListener('click', () => {
        renameModal.style.display = 'none';
    });

    renameConfirmBtn.addEventListener('click', async () => {
        const newName = renameInput.value.trim();
        if (newName && newName !== selectedTabName) {
            try {
                await window.connectionWindow.renameFolder(selectedTabName, newName);
                await loadTabsFromFolders();
            } catch (err) {
                console.error('Rename failed:', err);
            }
        }
    renameModal.style.display = 'none';
    });

    // 💾 Save
    save_btn?.addEventListener('click', async () => {
        const db_refresh_res = await DatabaseRefreshFunction(db_host, db_refresh_icon, db_checked_icon, db_error_icon);
        const db_res = await DatabaseTestConn(
            db_host, db_port, db_name, db_username, db_password,
            db_settings_err_msg, db_test_conn_text, db_test_conn_icon, db_test_conn_err_icon
        );

        if (!validatePort(Number(backend_port.value))) {
            backend_port.focus();
            backend_settings_err_msg.innerText = 'Invalid backend port';
        } else if (!validateVersion(backend_version.value)) {
            backend_version.focus();
            backend_settings_err_msg.innerText = 'Invalid backend version. ex: v1';
        }

        if (db_refresh_res && db_res && validatePort(Number(backend_port.value)) && validateVersion(backend_version.value)) {
            const config = {
                backend_address: backend_address.value,
                backend_port: backend_port.value,
                backend_version: backend_version.value,
                db_host: db_host.value,
                db_port: db_port.value,
                db_name: db_name.value,
                db_username: db_username.value,
                db_password: db_password.value,
            };
            window.connectionWindow.saveToEnv(config);
        }

        setTimeout(() => {
            backend_settings_err_msg.innerText = '';
        }, 3000);
    });
});

