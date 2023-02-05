import _fs from 'fs-extra'
import { ipcRenderer } from 'electron'

export function getPath(name: Parameters<typeof Electron.app.getPath>[0]) {
  return ipcRenderer.invoke('get-path', name) as Promise<string>
}

export function getLocale() {
  return ipcRenderer.invoke('get-locale') as Promise<string>
}

export function showItem(path: string) {
  if (_fs.existsSync(path)) {
    ipcRenderer.send('show-item', path)
  }
}

export function openPath(path: string) {
  if (_fs.existsSync(path)) {
    ipcRenderer.send('open-path', path)
  }
}

export function selectOpenFilePaths(options: Electron.OpenDialogOptions) {
  return ipcRenderer.invoke('show-open-dialog', options) as Promise<string[] | null>
}

export function selectSaveFilePath(options: Electron.SaveDialogOptions) {
  return ipcRenderer.invoke('show-save-dialog', options) as Promise<string | null>
}
