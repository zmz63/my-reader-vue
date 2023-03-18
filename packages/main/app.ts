import {
  type App,
  BrowserWindow,
  type OpenDialogOptions,
  type SaveDialogOptions,
  app,
  dialog,
  ipcMain,
  shell
} from 'electron'

export function listenAppChannel() {
  ipcMain.handle('app:show-open-dialog', async (event, options: OpenDialogOptions) => {
    const window = BrowserWindow.fromWebContents(event.sender)

    if (!window) {
      return
    }

    const { canceled, filePaths } = await dialog.showOpenDialog(window, options)
    if (canceled) {
      return
    } else {
      return filePaths
    }
  })

  ipcMain.handle('app:show-save-dialog', async (event, options: SaveDialogOptions) => {
    const window = BrowserWindow.fromWebContents(event.sender)

    if (!window) {
      return
    }

    const { canceled, filePath } = await dialog.showSaveDialog(window, options)
    if (canceled) {
      return
    } else {
      return filePath
    }
  })

  ipcMain.handle('app:get-path', (_, name: Parameters<App['getPath']>[0]) => app.getPath(name))

  ipcMain.handle('app:get-locale', () => app.getLocale())

  ipcMain.on('app:show-item', (_, path: string) => shell.showItemInFolder(path))

  ipcMain.on('app:open-path', (_, path: string) => shell.openPath(path))
}
