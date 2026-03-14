const { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu, dialog, net } = require('electron')
const path = require('path')
const fs = require('fs')
const fsp = require('fs').promises;
const os = require('os');
const { ObjectToENV } = require('./utils/HelperFunction')
const { prcEnv: env, } = require('../Common/static')
const { TryConnToSql: TryConnToServer, sqlConfig: sqlConn } = require('../Common/mssql')
const { Main, app_exp } = require('../BackendAPI/server')
const { SendPing, InvalidateQueryCache, GetQueriesBasePath } = require('../Common/functions')
const { setupSync } =  require('../Common/copySetup');

app.whenReady().then(() => {
    try {
        setupSync(); // Setup işlemlerini başlat 
        console.log('✅ Setup completed successfully');
    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
});



const log = require('electron-log')
const moment = require('moment')

let connectionWin = null, authorizationWin = null, globalContextMenu = null, tray = null;
let settingsWinTitleForAuth = "Connection Settings "
const envPath = GetQueriesBasePath('Default', '.env');
log.initialize();
const level = process.env.NODE_ENV === 'development' ? 'debug' : 'silly'
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'
log.transports.console.level = level
log.transports.file.fileName = `${moment().format('YYYY-MM-DD')}.log`
log.transports.file.level = level
console.log = log.log


const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
            width: 200,
            height: 75,
            type: "info",
            buttons: ["OK"],
            title: "Maglumat",
            message: `Programma eýýäm işläp dur`,
        });
    })
}

function BootstrapExpressApp() {
    try {
        const port = env.backend_port || parseInt(env.backend_port) + 1
        app_exp.set("domain", env.backend_address || "127.0.0.1");
        app_exp.listen(port, function (err) {
            if (err) {
                log.error('Listening error: ', err)
            } else {
                log.info(`Success.-y listening port:  ${port}`)
                Main()

            }
        });
    } catch (error) {
        log.error('Express app main (listen) error: ', error)
    }
}



const createMainWindow = async () => {
    const indexPath = path.join(__dirname, 'windows/main/index.html')
    const preloadPath = path.join(__dirname, 'windows/main/indexPreload.js')
    let mainWin = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true,
            preload: preloadPath
        }
    })
    createMainTray()
    mainWin.loadFile(indexPath)
    Checkers()
}

function createConnectionWindow() {
    const indexPath = path.join(__dirname, 'windows/connection/connection.html')
    const preloadPath = path.join(__dirname, 'windows/connection/connectionPreload.js')
    const iconPath = path.join(__dirname, 'assets/icons/settings_icon.png')
    const connectionIco = nativeImage.createFromPath(iconPath)

    connectionWin = new BrowserWindow({
        width: 600,
        height: 760,
        fullscreenable: false,
        maximizable: false,
        resizable: false,
        icon: connectionIco,
        webPreferences: {
            nodeIntegration: true,
            preload: preloadPath,
        }
    })
    connectionWin.setMenuBarVisibility(false)
    // connectionWin.webContents.openDevTools()
    connectionWin.loadFile(indexPath)

}

function createAboutWindow() {

    const indexPath = path.join(__dirname, 'windows/about/about.html')
    const preloadPath = path.join(__dirname, 'windows/about/aboutPreload.js')
    const aboutIconPath = path.join(__dirname, 'assets/icons/about_icon.png')
    const aboutIcon = nativeImage.createFromPath(aboutIconPath)

    let aboutWin = new BrowserWindow({
        width: 400,
        height: 640,
        fullscreenable: false,
        maximizable: false,
        resizable: false,
        icon: aboutIcon,
        webPreferences: {
            nodeIntegration: true,
            preload: preloadPath
        }
    })
    aboutWin.setMenuBarVisibility(false)
    // aboutWin.webContents.openDevTools()
    aboutWin.setTitle('Information Window')
    aboutWin.loadFile(indexPath)

}


function createAuthorizationWindow(windowName, title) {
    let authIndex = path.join(__dirname, 'windows/authorization/authorization.html')
    let iconPath = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/auth_icon.png'))
    const preloadScript = path.join(__dirname, 'windows/authorization/authorizationPreload.js')
    authorizationWin = new BrowserWindow({
        width: 320,
        height: 200,
        modal: true,
        resizable: false,
        hasShadow: true,
        hasShadow: true,
        minimizable: false,
        fullscreenable: false,
        icon: iconPath,
        webPreferences: {
            //sql editor ucin
            nodeIntegration: true,
            preload: preloadScript
        }
    })
    authorizationWin.setTitle(title || 'Authorization')
    authorizationWin.setMenuBarVisibility(false)

    // authorizationWin.webContents.openDevTools()
    authorizationWin.loadFile(authIndex)
    
    authorizationWin.webContents.on('did-finish-load', () => {
        authorizationWin.webContents.send('window_name_channel', windowName)
    })
    
    return authorizationWin
}


function createMainTray() {
    let trayIconPath = path.join(__dirname, 'assets/icons/hs_ss_logo_white.ico'),
        aboutIconPath = path.join(__dirname, 'assets/icons/about_icon.png'),
        restartIconPath = path.join(__dirname, 'assets/icons/restart_icon.png'),
        exitIconPath = path.join(__dirname, 'assets/icons/exit_icon.png'),
        connIconPath = path.join(__dirname, 'assets/icons/settings_icon.png');

    let trayIcon = nativeImage.createFromPath(trayIconPath),
        aboutIcon = nativeImage.createFromPath(aboutIconPath),
        restartIcon = nativeImage.createFromPath(restartIconPath),
        exitIcon = nativeImage.createFromPath(exitIconPath),
        connectionIcon = nativeImage.createFromPath(connIconPath);

    tray = new Tray(trayIcon.resize({ height: 32, width: 32, }))

    tray.on('double-click', () => {
        createAboutWindow()
    });

    globalContextMenu = Menu.buildFromTemplate([
        {
            label: 'About',
            click() {
                createAboutWindow()
            },
            icon: aboutIcon.resize({ height: 24, width: 24 })
        },
        {
            label: 'Connection Settings',
            icon: connectionIcon.resize({ height: 24, width: 24 }),
            click() {
                createAuthorizationWindow('createConnectionWindow', settingsWinTitleForAuth)
            }
        },
        {
            label: 'Restart',
            click() {
                app.relaunch()
                app.quit()
            },
            icon: restartIcon.resize({ height: 24, width: 24 }),
        },
        {
            id: 'exit',
            label: 'Exit',
            click() {
                closeApp()
            },
            icon: exitIcon.resize({ height: 24, width: 24 })
        }
    ])

    tray.setToolTip('Server Solution')
    tray.setContextMenu(globalContextMenu)


    return tray
}




async function Checkers() {

    const checkConnRes = await checkConnections()
    if (!checkConnRes) {
        createAuthorizationWindow('createConnectionWindow', settingsWinTitleForAuth)
        return
    }
    BootstrapExpressApp()
}

// // Funksiýa: bar bolan dogry Queries ýoluny tap
function readFolderRecursive(dirPath) {
    const result = {
        folderName: path.basename(dirPath),
        fullPath: dirPath,
        files: [],
        subFolders: []
    };

    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    items.forEach(item => {
        const full = path.join(dirPath, item.name);
        if (item.isDirectory()) {
            result.subFolders.push(readFolderRecursive(full));
        } else if (item.isFile() && item.name.endsWith(".sql")) {
            result.files.push(item.name);
        }
    });

    return result;
}

ipcMain.handle("get-queries-list", async () => {
    const baseDir = GetQueriesBasePath('Default', 'Queries');

    const items = fs.readdirSync(baseDir, { withFileTypes: true });

    const result = items
        .filter(item => item.isDirectory())
        .map(item => readFolderRecursive(path.join(baseDir, item.name)));

    return result;
});

ipcMain.handle("notify", async (event, data) => {
    return data
})

ipcMain.handle('open-query-editor', async (event, folder, filename) => {
    try {
        const queryWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, 'windows/queryEditor/editorPreload.js'),
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: false,
            },
        });

        await queryWindow.loadFile(path.join(__dirname, 'windows/queryEditor/editor.html'));

        const basePath = GetQueriesBasePath();
        if (!basePath) {
            throw new Error('Queries base path is not defined');
        }

        // folder üýtgeýjisiniň relatif ýolyny dogry almak
        const normalizedFolder = path.normalize(folder).replace(basePath, '').replace(/^[\\/]+/, '');
        const finalFilename = filename.endsWith('.sql') ? filename : `${filename}.sql`;
        const fullPath = path.join(basePath, normalizedFolder, finalFilename);

        console.log('🔍 Full path to query file:', fullPath);

        if (!fs.existsSync(fullPath)) {
            throw new Error(`Query file not found: ${fullPath}`);
        }

        const content = await fsp.readFile(fullPath, 'utf-8');
        queryWindow.webContents.send('load-file-content', {
            folder: normalizedFolder,
            filename: finalFilename,
            content,
            fullPath,
        });
    } catch (err) {
        console.error('Error reading query file:', err.message);
        queryWindow.webContents.send('load-file-content', {
            folder,
            filename: filename || 'unknown.sql',
            content: `/* Error loading file: ${err.message} */`,
            fullPath: '',
        });
        dialog.showErrorBox('Error', `Failed to open query file: ${err.message}`);
    }
});

ipcMain.handle('save-query-file', async (event, filePath, content) => {
    try {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('File saved:', filePath);
        const folderName = path.basename(path.dirname(filePath));
        const subFolderName = path.basename(path.dirname(path.dirname(filePath)));
        const queryName = path.basename(filePath, '.sql');
        InvalidateQueryCache(folderName, subFolderName, queryName,);
    } catch (err) {
        console.error('Failed to save file:', err);
        throw err;
    }
});

ipcMain.handle('get-folders', async () => {
    const baseDir = GetQueriesBasePath();
    let folders = [];

    try {
        const entries = fs.readdirSync(baseDir);
        for (const entry of entries) {
            const fullPath = path.join(baseDir, entry);
            try {
                const stats = fs.statSync(fullPath);
                if (stats.isDirectory() && entry.startsWith('ServerSolution')) {
                    folders.push(entry);
                }
            } catch {
                continue;
            }
        }
    } catch (err) {
        console.error('Error reading folders:', err);
    }

    return folders;
});

// Rename and delete folders
ipcMain.handle('rename-folder', async (event, oldName, newName) => {
    const defoultPath = GetQueriesBasePath() 
    const oldPath = path.join(defoultPath , 'ServerSolution' + oldName);
    const newPath = path.join(defoultPath , 'ServerSolution' + newName);
    await fs.promises.rename(oldPath, newPath);
});

ipcMain.handle('delete-folder', async (event, name) => {
    const defaultPath = GetQueriesBasePath();
    const folderPath = path.join(defaultPath, 'ServerSolution' + name);
    try {
        const entries = await fs.promises.readdir(defaultPath, { withFileTypes: true });
        const onlyDirs = entries.filter(e => e.isDirectory());

        if (onlyDirs.length <= 1 && name === 'Default') {
            return { success: false, message: 'Soňky papka pozulmaýar' };
        }
        await fs.promises.rm(folderPath, { recursive: true, force: true });
        return { success: true, message: 'Pozuldy' };
    } catch (err) {
        return { success: false, message: err.message };
    }
});

// Copy folder
ipcMain.handle('copy-folder', async (event, newName) => {
    const baseDir = GetQueriesBasePath();
    const source = path.join(baseDir, 'ServerSolutionDefault');
    const target = path.join(baseDir, `ServerSolution${newName}`);
    fs.cpSync(source, target, { recursive: true });
    return `ServerSolution${newName}`;
});

ipcMain.on('open_about_window', (event, arg) => {
    BrowserWindow.getFocusedWindow().close()
    createAboutWindow()
    log.info('About window opened')
})



ipcMain.on('open_connection_window', (event, arg) => {
    BrowserWindow.getFocusedWindow().close()
    createConnectionWindow()
    log.info('Connection window opened')
})


ipcMain.on('close_about_win', () => {
    BrowserWindow.getFocusedWindow().close()
    log.info('About window closed')
})

ipcMain.on('close_connection_window', () => {
    BrowserWindow.getFocusedWindow().close()
    log.info('Connection window closed')
})


ipcMain.on('save_to_env', async (event, args) => {
    let parsedData = JSON.parse(args);
    let assigned = Object.assign({}, process.env, parsedData);

    Object.keys(assigned).forEach((item) => {
        process.env[item] = assigned[item];
    });

    let envFormat = ObjectToENV(assigned);

    fs.writeFile(envPath, envFormat, async (err) => {
        if (err) {
            log.error('Error occurred while writing new config data to .env:', err);
            return;
        }
        log.info('Successfully saved data to .env');
        restartApp();
        BrowserWindow.getFocusedWindow().close();
    });
});

const fs1 = require('fs').promises;
const defaultPath = GetQueriesBasePath('Default', 'DefaultQueries');
ipcMain.handle('read-default-query', async (event, defaultPath) => {
  try {
    console.log('[DEBUG] Input path:', defaultPath);

    const resolvedPath = path.resolve(defaultPath);
    console.log('[DEBUG] Resolved path:', resolvedPath);

    await fs1.access(resolvedPath); // << BU YERDE DÜZGÜN fs1 ulanmaly
    const content = await fs1.readFile(resolvedPath, 'utf8');

    console.log('[READ] Content length:', content.length);
    return content;

  } catch (err) {
    console.error('[ERROR] reading default query:', err.message);
    return null;
  }
});

ipcMain.on('get-version', (event) => {
    event.returnValue = `${app.getName()}  v${app.getVersion()}`;
});

ipcMain.on('restart_app', () => {
    restartApp()
})

function restartApp() {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
        window.removeAllListeners('close');
        window.close();
    });
    app.relaunch();
    app.quit();
}

function closeApp() {
    app.quit()
    process.exit(0)
}

async function checkConnections() {
    const { alive } = await SendPing(env.backend_address)
    const sql_conn_res = await TryConnToServer(sqlConn)
    console.log("🚀 ~ checkConnections ~ sql_conn_res:", sql_conn_res)
    if (sql_conn_res.status === 200 && alive) {
        return true
    } else {
        return false
    }
}

app.whenReady().then(async () => {
    log.info('Server Solution is started...')
    createMainWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
    log.info('Server Solution is quited.')
})

function updateTrayIcon(imagePathOnDisk, trayTooltip) {
    const imagePath = path.join(__dirname, imagePathOnDisk)
    const image = nativeImage.createFromPath(imagePath)
    if (tray){
        tray.setImage(image || 'assets/icons/hs_ss_logo_white.ico')
        tray.setToolTip(trayTooltip || 'Server Solution')
    }

}

const activeIcon = 'assets/icons/hs_ss_logo_green.ico';
const inactiveIcon = 'assets/icons/hs_ss_logo_white.ico';
const activeText = 'Server Solution | Active';
const inactiveText = 'Server Solution | Inactive';
let connectionStatus = false;

setInterval(checkConnectionStatus, 5000);

async function checkConnectionStatus() {
    try {
      const newConnectionStatus = await checkConnections();
      if (newConnectionStatus !== connectionStatus) {
        updateTrayIcon(
          newConnectionStatus ? activeIcon : inactiveIcon,
          newConnectionStatus ? activeText : inactiveText
        );
        connectionStatus = newConnectionStatus;
      }
    } catch (error) {
      log.error('Baglanyşykda oshibka bar:', error);
    }
}