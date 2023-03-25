/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcMain } from 'electron'
import type { RunResult } from 'better-sqlite3'
import { Client } from './client'
import type { DBPayload } from './server'
import Sqlite3 from 'better-sqlite3'
new Sqlite3('./temp/books.db')

const client = new Client()

export function listenDBChannel() {
  ipcMain.handle('db:run', (_, data: DBPayload) => client.request<RunResult>('run', data))

  ipcMain.handle('db:get', (_, data: DBPayload) => client.request<any>('get', data))

  ipcMain.handle('db:all', (_, data: DBPayload) => client.request<any[]>('all', data))
}
