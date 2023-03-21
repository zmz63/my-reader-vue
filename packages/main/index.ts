import { BrowserWindow, app, shell } from 'electron'
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
    // contents.on('will-navigate', (event, url) => {
    //   console.log('$$$', url)
    // })

    contents.setWindowOpenHandler(({ url }) => {
      console.log('###', url)
      shell.openExternal(url)

      return { action: 'deny' }
    })
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
