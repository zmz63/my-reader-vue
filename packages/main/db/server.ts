/* eslint-disable @typescript-eslint/no-explicit-any */
import Sqlite3 from 'better-sqlite3'
import v1 from './schemas/v1'

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

const DATABASE_PATH = './temp/books.db'

const SCHEMAS = [v1]

const SCHEMA_VERSION = SCHEMAS.length

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

export class Server {
  db: Sqlite3.Database

  version = 0

  constructor() {
    this.db = new Sqlite3(DATABASE_PATH)

    this.db.pragma('journal_mode = WAL')
    this.db.pragma('synchronous = FULL')
    this.db.pragma('fullfsync = ON')

    this.version = this.db.pragma('user_version', { simple: true })

    this.updateSchema()
  }

  updateSchema() {
    if (this.version < SCHEMA_VERSION) {
      this.db.transaction(() => {
        for (const schema of SCHEMAS) {
          if (schema.version > this.version) {
            for (const sentence of schema.sentences) {
              this.db.exec(sentence)
            }
          }
        }

        this.db.pragma(`user_version = ${SCHEMA_VERSION}`)
      })()

      this.version = SCHEMA_VERSION
    }
  }

  process(type: string, data: any) {
    console.log(type, data)

    switch (type) {
      case 'insert-book':
        return this.insertBook(data)
      case 'get-book':
        return this.getBook(data)
      case 'get-book-meta-list':
        return this.getBookMetaList()
      case 'update-book':
        return this.updateBook()
      default:
        break
    }
  }

  insertBook(book: BookData) {
    const id = this.db
      .prepare('SELECT rowid FROM books WHERE md5 = ? AND (title = ? OR creator = ?)')
      .get(book.md5, book.title, book.creator) as number | undefined

    if (id) {
      throw new Error('')
    }

    const keys = Object.keys(book)

    return this.db
      .prepare(
        `INSERT INTO books (${keys.join(', ')}) VALUES (${keys.map(key => `$${key}`).join(', ')});`
      )
      .run(book).lastInsertRowid
  }

  getBook(rowid: number) {
    return this.db.prepare('SELECT * FROM books WHERE rowid = ?').get(rowid) as BookData | undefined
  }

  getBookMetaList() {
    return this.db
      .prepare(`SELECT rowid, ${BOOK_META_KEYS.join(', ')} FROM books`)
      .all() as BookMeta[]
  }

  updateBook() {
    //
  }

  close() {
    this.db.close()
  }
}
