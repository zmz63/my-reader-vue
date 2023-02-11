import { ipcRenderer } from 'electron'
import type { WindowStateEvent } from '@preload/types'
import type { WindowControlType } from '@packages/constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function controlWindow(type: WindowControlType, ...args: any[]) {
  ipcRenderer.send('window-control', type, ...args)
}

export function addWindowStateListener(
  event: WindowStateEvent,
  callback: (value: boolean) => void
) {
  const listener = (_: Electron.IpcRendererEvent, value: boolean) => callback(value)

  ipcRenderer.on(`window-${event}`, listener)

  return () => {
    ipcRenderer.removeListener(`window-${event}`, listener)
  }
}
