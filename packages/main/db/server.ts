/* eslint-disable @typescript-eslint/no-explicit-any */
import Sqlite3 from 'better-sqlite3'
import v1 from './schemas/v1'

export type BookData = {
  md5: string
  size: number
  createTime: number
  path?: string | null
  file?: Buffer | null
  title?: string | null
  cover?: Buffer | null
  creator?: string | null
  description?: string | null
  identifier?: string | null
  location?: string | null
  accessTime?: number | null
}

const DATABASE_PATH = './temp/books.db'

const SCHEMAS = [v1]

const SCHEMA_VERSION = SCHEMAS.length

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
      const update = this.db.transaction(() => {
        for (const schema of SCHEMAS) {
          if (schema.version > this.version) {
            for (const sentence of schema.sentences) {
              this.db.exec(sentence)
            }
          }
        }

        this.db.pragma(`user_version = ${SCHEMA_VERSION}`)
      })

      update()

      this.version = SCHEMA_VERSION
    }
  }

  process(type: string, data: any) {
    console.log(type, data)

    switch (type) {
      case 'add-book':
        return this.addBook(data)
      default:
        break
    }
  }

  addBook(book: BookData) {
    const keys = Object.keys(book)

    const task = this.db.prepare(
      `INSERT INTO books (${keys.join(',')}) VALUES (${keys.map(key => `$${key}`).join(',')});`
    )

    task.run(book)
  }

  close() {
    this.db.close()
  }
}
