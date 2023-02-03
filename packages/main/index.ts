import _path from 'path'
import { BrowserWindow, app, dialog, ipcMain, shell } from 'electron'
import { WindowOperationType } from '@packages/global'

const gotTheLock = app.requestSingleInstanceLock()
let mainWindow: BrowserWindow

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }
  })
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    show: false,
    frame: false,
    // transparent: true,
    width: 900,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      devTools: true,
      preload: _path.join(__dirname, '../preload/index.js'),
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      // contextIsolation: false,
      disableDialogs: true,
      enableWebSQL: false,
      spellcheck: false,
      webgl: false
    }
  })

  mainWindow.hookWindowMessage(0x0116, () => {
    mainWindow.setEnabled(false)
    mainWindow.setEnabled(true)
  })

  if (app.isPackaged) {
    mainWindow.loadFile(_path.resolve(__dirname, '../renderer/index.html'))
  } else {
    mainWindow.loadURL('http://localhost:8080')
    mainWindow.webContents.openDevTools({ mode: 'undocked' })
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximize', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximize', false)
  })
}

app.whenReady().then(() => {
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, url) => {
    console.log('$$$', url)
  })

  contents.setWindowOpenHandler(({ url }) => {
    console.log('###', url)
    shell.openExternal(url)

    return { action: 'deny' }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('window-operate', (event, type: WindowOperationType) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (window) {
    switch (type) {
      case WindowOperationType.ON_TOP:
        // if (window.isAlwaysOnTop()) {
        //   window.unmaximize()
        // } else {
        //   window.maximize()
        // }
        break
      case WindowOperationType.MINIMIZE:
        window.minimize()
        break
      case WindowOperationType.MAXIMIZE:
        if (window.isMaximized()) {
          window.unmaximize()
        } else {
          window.maximize()
        }
        break
      case WindowOperationType.CLOSE:
        window.close()
        break
      default:
        break
    }
  }
})

ipcMain.handle('window-is-maximized', event => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (window) {
    window.webContents.send('window-maximize', window.isMaximized())
  }
})

ipcMain.handle('book-select', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'Electronic Book', extensions: ['epub'] }],
    properties: ['multiSelections']
  })

  if (canceled) {
    return
  } else {
    return filePaths
  }
})
