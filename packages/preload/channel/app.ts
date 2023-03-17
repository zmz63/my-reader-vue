import _fs from 'fs-extra'
import { type App, type OpenDialogOptions, type SaveDialogOptions, ipcRenderer } from 'electron'

export function getPath(name: Parameters<App['getPath']>[0]) {
  return ipcRenderer.invoke('app:get-path', name) as Promise<string>
}

export function getLocale() {
  return ipcRenderer.invoke('app:get-locale') as Promise<string>
}

export function showItem(path: string) {
  if (_fs.existsSync(path)) {
    ipcRenderer.send('app:show-item', path)
  }
}

export function openPath(path: string) {
  if (_fs.existsSync(path)) {
    ipcRenderer.send('app:open-path', path)
  }
}

export function selectOpenFilePaths(options: OpenDialogOptions) {
  return ipcRenderer.invoke('app:show-open-dialog', options) as Promise<string[] | null>
}

export function selectSaveFilePath(options: SaveDialogOptions) {
  return ipcRenderer.invoke('app:show-save-dialog', options) as Promise<string | null>
}
