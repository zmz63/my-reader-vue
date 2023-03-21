/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcRenderer } from 'electron'
import type { RunResult } from 'better-sqlite3'

export type BookMeta = {
  rowid: number
  md5: string
  size: number
  createTime: number
  path?: string | null
  location?: string | null
  accessTime?: number | null
  title?: string | null
  cover?: Buffer | null
  creator?: string | null
  description?: string | null
  date?: string | null
  publisher?: string | null
  identifier?: string | null
}

export type BookData = {
  file?: Buffer | null
} & Omit<BookMeta, 'rowid'>

const BOOK_META_KEYS = [
  'path',
  'location',
  'accessTime',
  'title',
  'cover',
  'creator',
  'description',
  'date',
  'publisher',
  'identifier'
]

function invokeDB(type: 'run', source: string, params?: any[]): Promise<RunResult>
function invokeDB(type: 'get', source: string, params?: any[]): Promise<any>
function invokeDB(type: 'all', source: string, params?: any[]): Promise<any[]>
function invokeDB(type: 'run' | 'get' | 'all', source: string, params?: any[]) {
  return ipcRenderer.invoke(`db:${type}`, { source, params })
}

export async function insertBook(book: BookData) {
  const target = (await invokeDB(
    'get',
    'SELECT rowid FROM books WHERE md5 = ? AND (title = ? OR creator = ?)',
    [book.md5, book.title, book.creator]
  )) as { rowid: number } | undefined

  if (target) {
    return { code: 1, id: target.rowid }
  }

  if (book.path) {
    const target = (await invokeDB('get', 'SELECT rowid FROM books WHERE path = ?', [
      book.path
    ])) as { rowid: number } | undefined

    if (target) {
      return { code: 0, id: target.rowid }
    }
  }

  const keys = Object.keys(book)

  const result = await invokeDB(
    'run',
    `INSERT INTO books (${keys.join(', ')}) VALUES (${keys.map(key => `$${key}`).join(', ')})`,
    [book]
  )

  return { code: 0, id: result.lastInsertRowid }
}

export async function updateBook(id: number, book: Partial<BookData>) {
  const keys = Object.keys(book)

  return await invokeDB(
    'run',
    `UPDATE books SET ${keys.map(key => `${key} = $${key}`).join(', ')} WHERE rowid = ?`,
    [book, id]
  )
}

export async function deleteBook(id: number) {
  return await invokeDB('run', `DELETE FROM books WHERE rowid = ?`, [id])
}

export function getBookById(id: number) {
  return invokeDB('get', 'SELECT * FROM books WHERE rowid = ?', [id]) as Promise<
    BookData | undefined
  >
}

export function getBookMetaList(size = 20, offset = 0, order: 'DESC' | 'ASC' = 'DESC') {
  return invokeDB(
    'all',
    `SELECT rowid, ${BOOK_META_KEYS.join(
      ', '
    )} FROM books ORDER BY rowid ${order} LIMIT ${size} OFFSET ${offset}`
  ) as Promise<BookMeta[]>
}

export function getRecentBookMetaList() {
  return invokeDB(
    'all',
    `SELECT rowid, ${BOOK_META_KEYS.join(
      ', '
    )} FROM books WHERE accessTime IS NOT NULL ORDER BY accessTime DESC LIMIT 20`
  ) as Promise<BookMeta[]>
}

export function getBookMetaListByTitle(title: string, size = 20, fuzzy = true) {
  return invokeDB(
    'all',
    `SELECT rowid, ${BOOK_META_KEYS.join(', ')} FROM books WHERE title ${
      fuzzy ? 'LIKE' : '='
    } ? LIMIT ${size}`,
    [fuzzy ? `%${title}%` : title]
  ) as Promise<BookMeta[]>
}

export function getBookMetaListByCreator(creator: string, size = 20, fuzzy = true) {
  return invokeDB(
    'all',
    `SELECT rowid, ${BOOK_META_KEYS.join(', ')} FROM books WHERE creator ${
      fuzzy ? 'LIKE' : '='
    } ? LIMIT ${size}`,
    [fuzzy ? `%${creator}%` : creator]
  ) as Promise<BookMeta[]>
}

export function getBookMetaListByPublisher(publisher: string, size = 20, fuzzy = true) {
  return invokeDB(
    'all',
    `SELECT rowid, ${BOOK_META_KEYS.join(', ')} FROM books WHERE publisher ${
      fuzzy ? 'LIKE' : '='
    } ? LIMIT ${size}`,
    [fuzzy ? `%${publisher}%` : publisher]
  ) as Promise<BookMeta[]>
}
