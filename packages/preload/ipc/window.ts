import { ipcRenderer } from 'electron'
import type { WindowControlType } from '@packages/constants'

export type WindowStateEvent = 'maximize' | 'always-on-top-changed'

export function controlWindow(type: WindowControlType, ...args: unknown[]) {
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
