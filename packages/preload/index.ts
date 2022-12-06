import { contextBridge } from 'electron'
import windowUtil from './utils/window'
import bookUtil from './utils/book'

contextBridge.exposeInMainWorld('electron', {
  windowUtil,
  bookUtil
})
