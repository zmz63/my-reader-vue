import { ipcMain } from 'electron'
import { Client } from './client'
import type { BookData, BookMeta } from '@main/db/server'

const client = new Client()

export function listenDBChannel() {
  ipcMain.handle('db:insert-book', (_, book: BookData) =>
    client.request<number>('insert-book', book)
  )

  ipcMain.handle('db:get-book', (_, rowid: number) =>
    client.request<BookData | undefined>('get-book', rowid)
  )

  ipcMain.handle('db:get-book-meta-list', () => client.request<BookMeta[]>('get-book-meta-list'))

  ipcMain.handle('db:update-book', () => client.request('update-book'))
}
