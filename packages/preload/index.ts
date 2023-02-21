// import { contextBridge } from 'electron'
import * as appIPC from '@preload/ipc/app'
import * as windowIPC from '@preload/ipc/window'
import * as ePub from './epub'

// import Database from 'better-sqlite3'

// console.log('@@@', Database)
// const db = new Database('./temp/books.db')
// console.log('@@@', db)

// contextBridge.exposeInMainWorld('appIPC', appIPC)
// contextBridge.exposeInMainWorld('windowIPC', windowIPC)

window.appIPC = appIPC
window.windowIPC = windowIPC
window.ePub = ePub
