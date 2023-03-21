/* eslint-disable @typescript-eslint/no-explicit-any */
import Sqlite3 from 'better-sqlite3'
import v1 from './schemas/v1'

export type DBPayload = {
  source: string
  params?: any[]
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

  process(type: string, data: DBPayload) {
    switch (type) {
      case 'run':
        return this.run(data.source, data.params || [])
      case 'get':
        return this.get(data.source, data.params || [])
      case 'all':
        return this.all(data.source, data.params || [])
      default:
        break
    }
  }

  run(source: string, params: any[]) {
    return this.db.prepare(source).run(...params)
  }

  get(source: string, params: any[]) {
    return this.db.prepare(source).get(...params)
  }

  all(source: string, params: any[]) {
    return this.db.prepare(source).all(...params)
  }

  close() {
    this.db.close()
  }
}
