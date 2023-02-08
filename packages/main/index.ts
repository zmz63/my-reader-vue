import _path from 'path'
import { BrowserWindow, app, dialog, ipcMain, shell } from 'electron'
import { WindowControlType } from '@packages/global'

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
      contextIsolation: false,
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

  mainWindow.on('always-on-top-changed', () => {
    mainWindow.webContents.send('window-on-top', mainWindow.isAlwaysOnTop())
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
  // contents.on('will-navigate', (event, url) => {
  //   console.log('$$$', url)
  // })

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
ipcMain.on('window-control', (event, type: WindowControlType, ...args: any[]) => {
  const window = BrowserWindow.fromWebContents(event.sender)

  if (window) {
    switch (type) {
      case WindowControlType.ON_TOP:
        window.setAlwaysOnTop(args[0])
        break
      case WindowControlType.MINIMIZE:
        window.minimize()
        break
      case WindowControlType.MAXIMIZE:
        if (args[0]) {
          window.maximize()
        } else {
          window.unmaximize()
        }
        break
      case WindowControlType.CLOSE:
        window.close()
        break
      default:
        break
    }
  }
})

ipcMain.handle('show-open-dialog', async (event, options: Electron.OpenDialogOptions) => {
  const window = BrowserWindow.fromWebContents(event.sender)

  if (window !== mainWindow) {
    return null
  }

  const { canceled, filePaths } = await dialog.showOpenDialog(window, options)
  if (canceled) {
    return null
  } else {
    return filePaths
  }
})

ipcMain.handle('show-save-dialog', async (event, options: Electron.SaveDialogOptions) => {
  const window = BrowserWindow.fromWebContents(event.sender)

  if (window !== mainWindow) {
    return null
  }

  const { canceled, filePath } = await dialog.showSaveDialog(window, options)
  if (canceled) {
    return null
  } else {
    return filePath
  }
})

ipcMain.handle('get-path', (_, name: Parameters<typeof Electron.app.getPath>[0]) =>
  app.getPath(name)
)

ipcMain.handle('get-locale', () => app.getLocale())

ipcMain.on('show-item', (_, path: string) => shell.showItemInFolder(path))

ipcMain.on('open-path', (_, path: string) => shell.openPath(path))
