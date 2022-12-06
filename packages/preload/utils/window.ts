import { ipcRenderer } from 'electron'

export type WindowOperationType = 'minimize' | 'maximize' | 'close'

function manageWindow(type: WindowOperationType) {
  ipcRenderer.send('window-manage', type)
}

function onWindowMaximize(callback: (isMaximized: boolean) => void) {
  const listener = (_: Electron.IpcRendererEvent, isMaximized: boolean) => callback(isMaximized)
  ipcRenderer.on('window-maximize', listener)
  ipcRenderer.send('window-is-maximized')

  return () => {
    ipcRenderer.removeListener('window-maximize', listener)
  }
}

const windowUtil = {
  manageWindow,
  onWindowMaximize
}

export type WindowUtil = typeof windowUtil

export default windowUtil
