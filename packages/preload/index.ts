// import { contextBridge } from 'electron'
import * as appIPC from '@preload/ipc/app'
import * as windowIPC from '@preload/ipc/window'
import { EPub } from './utils/epub'

export type AppIPC = typeof appIPC

export type WindowIPC = typeof windowIPC

// contextBridge.exposeInMainWorld('appIPC', appIPC)
// contextBridge.exposeInMainWorld('windowIPC', windowIPC)

window.appIPC = appIPC
window.windowIPC = windowIPC
window.EPub = EPub
