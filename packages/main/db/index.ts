import { ipcMain } from 'electron'
import { Client } from './client'
import type { BookData } from '@main/db/server'

const client = new Client()

export function listenDBChannel() {
  ipcMain.handle('db:add-book', (_, book: BookData) => client.request<number>('add-book', book))

  ipcMain.handle('db:get-books', () => client.request('get-books'))

  ipcMain.handle('db:get-recent-books', () => client.request('get-recent-books'))
}
