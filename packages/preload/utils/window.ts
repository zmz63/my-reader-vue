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

const windowUtil = {
  operateWindow,
  listenWindowMaximize
}

export type WindowUtil = typeof windowUtil

export default windowUtil
