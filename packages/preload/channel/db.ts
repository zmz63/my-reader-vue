import { ipcRenderer } from 'electron'
import type { BookData, BookMeta } from '@main/db/server'

export function insertBook(book: BookData) {
  return ipcRenderer.invoke('db:insert-book', book) as Promise<number>
}

export function getBook(rowid: number) {
  return ipcRenderer.invoke('db:get-book', rowid) as Promise<BookData | undefined>
}

export function getBookMetaList() {
  return ipcRenderer.invoke('db:get-book-meta-list') as Promise<BookMeta[]>
}

export function updateBook() {
  return ipcRenderer.invoke('db:update-book') as Promise<void>
}
