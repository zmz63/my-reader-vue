import type { AppIPC, WindowIPC } from './preload/index'

declare global {
  interface Window {
    appIPC: AppIPC
    windowIPC: WindowIPC
  }

  const appIPC: AppIPC

  const windowIPC: WindowIPC
}

export const enum WindowControlType {
  ON_TOP,
  MINIMIZE,
  MAXIMIZE,
  CLOSE
}

export type WindowStateEvent = 'maximize' | 'on-top'
