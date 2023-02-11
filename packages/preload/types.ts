import type * as appIPC from '@preload/ipc/app'
import type * as windowIPC from '@preload/ipc/window'

export type AppIPC = typeof appIPC

export type WindowIPC = typeof windowIPC

declare global {
  interface Window {
    appIPC: AppIPC
    windowIPC: WindowIPC
  }

  const appIPC: AppIPC

  const windowIPC: WindowIPC
}

export type WindowStateEvent = 'maximize' | 'on-top'
