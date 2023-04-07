import { BrowserWindow, app, protocol, shell } from 'electron'
import _url from 'url'
import { listenAppChannel } from './app'
import { createWindow, listenWindowChannel } from './window'
import { listenDBChannel } from './db'

const gotTheLock = app.requestSingleInstanceLock()

console.log('argv', process.argv)

if (!gotTheLock) {
  app.quit()

  createWindow()
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  app.on('web-contents-created', (_, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)

      return { action: 'deny' }
    })
  })

  protocol.registerFileProtocol('book-cache', (request, callback) => {
    const filePath = _url.fileURLToPath(`file://${request.url.slice('book-cache://'.length)}`)
    callback(filePath)
  })

  listenWindowChannel()

  listenAppChannel()

  listenDBChannel()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
