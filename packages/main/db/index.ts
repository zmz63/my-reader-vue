import { ipcMain } from 'electron'
import { Client } from './client'

const client = new Client()

export function listenDBChannel() {
  ipcMain.handle('db:get-recent-books', async () => {
    //
  })
}
