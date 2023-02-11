// import { contextBridge } from 'electron'
import * as appIPC from '@preload/ipc/app'
import * as windowIPC from '@preload/ipc/window'
import { EPub } from './epub'

// contextBridge.exposeInMainWorld('appIPC', appIPC)
// contextBridge.exposeInMainWorld('windowIPC', windowIPC)

window.appIPC = appIPC
window.windowIPC = windowIPC
window.EPub = EPub
