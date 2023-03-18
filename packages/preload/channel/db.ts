import { ipcRenderer } from 'electron'
import type { BookData } from '@main/db/server'

export function addBook(book: BookData) {
  return ipcRenderer.invoke('db:add-book', book) as Promise<number>
}

export function getRecentBooks() {
  return ipcRenderer.invoke('db:get-recent-books') as Promise<void>
}
