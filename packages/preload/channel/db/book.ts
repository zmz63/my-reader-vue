import { invokeDB } from '.'

export type BookMeta = {
  rowid: number | bigint
  md5: string
  size: number
  createTime: number
  path?: string
  location?: string
  accessTime?: number
  title?: string
  cover?: Buffer | null
  creator?: string
  description?: string
  date?: string
  publisher?: string
  identifier?: string
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

export async function insertBook(book: BookData) {
  const target = await invokeDB<Pick<BookMeta, 'rowid' | 'location'> | undefined>(
    'get',
    'SELECT rowid, location, accessTime FROM books WHERE (md5 = ? AND (title = ? OR creator = ?)) OR identifier = ?',
    [book.md5, book.title, book.creator, book.identifier]
  )

  if (target) {
    return target
  }

  const keys = Object.keys(book)

  if (book.path) {
    const target = await invokeDB<Pick<BookMeta, 'rowid'> | undefined>(
      'get',
      'SELECT rowid FROM books WHERE path = ?',
      [book.path]
    )

    if (target) {
      await invokeDB(
        'run',
        `REPLACE books rowid = ?, (${keys.join(', ')}) VALUES (${keys
          .map(key => `$${key}`)
          .join(', ')})`,
        [target.rowid, book]
      )

      return { rowid: target.rowid }
    }
  }

  const result = await invokeDB(
    'run',
    `INSERT INTO books (${keys.join(', ')}) VALUES (${keys.map(key => `$${key}`).join(', ')})`,
    [book]
  )

  return { rowid: result.lastInsertRowid }
}

export function updateBook(id: number | bigint, book: Partial<BookData>) {
  const keys = Object.keys(book)

  return invokeDB(
    'run',
    `UPDATE books SET ${keys.map(key => `${key} = $${key}`).join(', ')} WHERE rowid = ?`,
    [book, id]
  )
}

export function deleteBook(id: number | bigint) {
  return invokeDB('run', `DELETE FROM books WHERE rowid = ?`, [id])
}

export function getBookById(id: number | bigint) {
  return invokeDB<BookData | undefined>('get', 'SELECT * FROM books WHERE rowid = ?', [id])
}

export function getBookMetaList(size = 20, offset = 0, order: 'DESC' | 'ASC' = 'DESC') {
  return invokeDB<BookMeta>(
    'all',
    `SELECT rowid, ${BOOK_META_KEYS.join(
      ', '
    )} FROM books ORDER BY rowid ${order} LIMIT ${size} OFFSET ${offset}`
  )
}

export function getRecentBookMetaList() {
  return invokeDB<BookMeta>(
    'all',
    `SELECT rowid, ${BOOK_META_KEYS.join(
      ', '
    )} FROM books WHERE accessTime IS NOT NULL ORDER BY accessTime DESC LIMIT 20`
  )
}

export function getBookMetaListByTitle(title: string, size = 20, fuzzy = true) {
  return invokeDB<BookMeta>(
    'all',
    `SELECT rowid, ${BOOK_META_KEYS.join(', ')} FROM books WHERE title ${
      fuzzy ? 'LIKE' : '='
    } ? LIMIT ${size}`,
    [fuzzy ? `%${title}%` : title]
  )
}

export function getBookMetaListByCreator(creator: string, size = 20, fuzzy = true) {
  return invokeDB<BookMeta>(
    'all',
    `SELECT rowid, ${BOOK_META_KEYS.join(', ')} FROM books WHERE creator ${
      fuzzy ? 'LIKE' : '='
    } ? LIMIT ${size}`,
    [fuzzy ? `%${creator}%` : creator]
  )
}

export function getBookMetaListByPublisher(publisher: string, size = 20, fuzzy = true) {
  return invokeDB<BookMeta>(
    'all',
    `SELECT rowid, ${BOOK_META_KEYS.join(', ')} FROM books WHERE publisher ${
      fuzzy ? 'LIKE' : '='
    } ? LIMIT ${size}`,
    [fuzzy ? `%${publisher}%` : publisher]
  )
}
