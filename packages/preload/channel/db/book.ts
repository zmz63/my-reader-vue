import { invokeDB } from '.'

export type BookData = {
  id: number | bigint
  md5: string
  size: number
  createTime: number
  // record
  file?: Buffer | null
  path?: string
  location?: string
  percentage?: number
  accessTime?: number
  readingTime?: number
  // meta
  title?: string
  cover?: Buffer | null
  creator?: string
  description?: string
  date?: string
  publisher?: string
  identifier?: string
}

export type BookMeta = Omit<BookData, 'file'>

const BOOK_META_KEYS = [
  'id',
  'md5',
  'size',
  'createTime',
  // record
  'path',
  'location',
  'percentage',
  'accessTime',
  'readingTime',
  // meta
  'title',
  'cover',
  'creator',
  'description',
  'date',
  'publisher',
  'identifier'
]

export async function insertBook(book: Omit<BookData, 'id'>) {
  const target = await invokeDB<
    Pick<BookMeta, 'id' | 'location' | 'percentage' | 'readingTime'> | undefined
  >(
    'get',
    'SELECT id, location, accessTime FROM books WHERE (md5 = ? AND (title = ? OR creator = ?)) OR identifier = ?',
    [book.md5, book.title, book.creator, book.identifier]
  )

  if (target) {
    return target
  }

  const keys = Object.keys(book)

  if (book.path) {
    const target = await invokeDB<Pick<BookMeta, 'id'> | undefined>(
      'get',
      'SELECT id FROM books WHERE path = ?',
      [book.path]
    )

    if (target) {
      await invokeDB(
        'run',
        `REPLACE books id = ?, (${keys.join(', ')}) VALUES (${keys
          .map(key => `$${key}`)
          .join(', ')})`,
        [target.id, book]
      )

      return { id: target.id }
    }
  }

  const result = await invokeDB(
    'run',
    `INSERT INTO books (${keys.join(', ')}) VALUES (${keys.map(key => `$${key}`).join(', ')})`,
    [book]
  )

  return { id: result.lastInsertRowid }
}

export function updateBook(id: number | bigint, book: Partial<Omit<BookData, 'id'>>) {
  const keys = Object.keys(book)

  return invokeDB(
    'run',
    `UPDATE books SET ${keys.map(key => `${key} = $${key}`).join(', ')} WHERE id = ?`,
    [book, id]
  )
}

export function deleteBook(id: number | bigint) {
  return invokeDB('run', `DELETE FROM books WHERE id = ?`, [id])
}

export function getBookById(id: number | bigint) {
  return invokeDB<BookData | undefined>('get', 'SELECT * FROM books WHERE id = ?', [id])
}

export async function getBookMetaList(size = 20, offset = 0, order: 'DESC' | 'ASC' = 'DESC') {
  const { count } = await invokeDB<{ count: number }>('get', 'SELECT COUNT(id) AS count FROM books')

  const list = await invokeDB<BookMeta>(
    'all',
    `SELECT ${BOOK_META_KEYS.join(
      ', '
    )} FROM books ORDER BY id ${order} LIMIT ${size} OFFSET ${offset}`
  )

  return {
    data: list,
    count
  }
}

export function getRecentBookMetaList() {
  return invokeDB<BookMeta>(
    'all',
    `SELECT ${BOOK_META_KEYS.join(
      ', '
    )} FROM books WHERE accessTime IS NOT NULL ORDER BY accessTime DESC LIMIT 20`
  )
}

export async function getBookMetaListByKeyword(
  keyword: string,
  size = 20,
  offset = 0,
  order: 'DESC' | 'ASC' = 'DESC'
) {
  const list = await invokeDB<BookMeta>(
    'all',
    `SELECT ${BOOK_META_KEYS.join(
      ', '
    )} FROM books WHERE title LIKE $keyword OR creator LIKE $keyword OR publisher LIKE $keyword ORDER BY id ${order} LIMIT ${size} OFFSET ${offset}`,
    [{ keyword: `%${keyword}%` }]
  )

  return {
    data: list,
    count: list.length
  }
}
