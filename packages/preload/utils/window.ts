import { ipcRenderer } from 'electron'
import type { WindowOperationType } from '@packages/global'

function operateWindow(type: WindowOperationType) {
  ipcRenderer.send('window-operate', type)
}

function listenWindowMaximize(callback: (isMaximized: boolean) => void) {
  const listener = (_: Electron.IpcRendererEvent, isMaximized: boolean) => callback(isMaximized)

  ipcRenderer.on('window-maximize', listener)
  ipcRenderer.invoke('window-is-maximized')

  return () => {
    ipcRenderer.removeListener('window-maximize', listener)
  }
}

function listenWindowOnTop(callback: (isOnTop: boolean) => void) {
  const listener = (_: Electron.IpcRendererEvent, isOnTop: boolean) => callback(isOnTop)

  ipcRenderer.on('window-on-top', listener)
  ipcRenderer.invoke('window-is-on-top')

  return () => {
    ipcRenderer.removeListener('window-on-top', listener)
  }
}

const windowUtil = {
  operateWindow,
  listenWindowOnTop,
  listenWindowMaximize
}

export type WindowUtil = typeof windowUtil

export default windowUtil
