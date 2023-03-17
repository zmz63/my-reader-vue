import { type IpcRendererEvent, ipcRenderer } from 'electron'

export function controlWindow(type: 'always-on-top', value: boolean): void
export function controlWindow(type: 'minimize'): void
export function controlWindow(type: 'maximize', value: boolean): void
export function controlWindow(type: 'close'): void
export function controlWindow(type: string, value?: boolean) {
  ipcRenderer.send('window:control', type, value)
}

export function addWindowStateListener(
  event: 'maximize' | 'always-on-top-changed',
  callback: (value: boolean) => void
) {
  const listener = (_: IpcRendererEvent, value: boolean) => callback(value)

  ipcRenderer.on(`window:${event}`, listener)

  return () => {
    ipcRenderer.removeListener(`window:${event}`, listener)
  }
}
