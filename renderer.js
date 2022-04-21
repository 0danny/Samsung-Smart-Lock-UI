const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

try {
    require('electron-reloader')(module)
} catch {
    console.log("[Production] There was an error loading the electron reloader.")
}

let win

function createWindow() {
    win = new BrowserWindow({
        width: 475,
        height: 670,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        frame: false
    })

    win.webContents.toggleDevTools()

    win.loadFile(path.resolve(__dirname, 'public/index.html'))
}

ipcMain.on('minimize', () => {
    win.isMinimized() ? win.restore() : win.minimize()
})

ipcMain.on('close', () => {
    win.close()
})

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})