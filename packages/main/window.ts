import _path from 'path'
import { BrowserWindow, app, ipcMain } from 'electron'

export function createWindow() {
  const window = new BrowserWindow({
    show: false,
    frame: false,
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

  const webContents = window.webContents

  window.hookWindowMessage(0x0116, () => {
    window.setEnabled(false)
    window.setEnabled(true)
  })

  if (app.isPackaged) {
    window.loadFile(_path.resolve(__dirname, '../renderer/index.html'))
  } else {
    window.loadURL('http://localhost:8080')
    webContents.openDevTools({ mode: 'undocked' })
  }

  window.once('ready-to-show', () => {
    window.show()
    window.focus()
  })

  window.on('maximize', () => {
    webContents.send('window:maximize', true)
  })

  window.on('unmaximize', () => {
    webContents.send('window:maximize', false)
  })

  window.on('always-on-top-changed', () => {
    webContents.send('window:always-on-top-changed', window.isAlwaysOnTop())
  })
}

export function listenWindowChannel() {
  ipcMain.on(
    'window:control',
    (event, type: 'always-on-top' | 'minimize' | 'maximize' | 'close', value?: boolean) => {
      const window = BrowserWindow.fromWebContents(event.sender)

      if (window) {
        switch (type) {
          case 'always-on-top':
            window.setAlwaysOnTop(value as boolean)
            break
          case 'minimize':
            window.minimize()
            break
          case 'maximize':
            if (value as boolean) {
              window.maximize()
            } else {
              window.unmaximize()
            }
            break
          case 'close':
            window.close()
            break
          default:
            break
        }
      }
    }
  )
}
