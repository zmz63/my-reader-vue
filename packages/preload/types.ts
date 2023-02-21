import type * as appIPC from '@preload/ipc/app'
import type * as windowIPC from '@preload/ipc/window'
import type * as ePub from './epub'

export type AppIPC = typeof appIPC

export type WindowIPC = typeof windowIPC

export type EPub = typeof ePub

declare global {
  interface Window {
    appIPC: AppIPC
    windowIPC: WindowIPC
    ePub: EPub
  }

  const appIPC: AppIPC

  const windowIPC: WindowIPC

  const ePub: EPub
}
