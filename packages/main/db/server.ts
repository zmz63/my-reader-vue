import Sqlite3 from 'better-sqlite3'
import v1 from './schemas/v1'

const DATABASE_PATH = './temp/books.db'

const SCHEMA_VERSION = 1

const SCHEMAS = [v1]

export class Server {
  db: Sqlite3.Database

  version = 0

  constructor() {
    this.db = new Sqlite3(DATABASE_PATH)

    this.db.pragma('journal_mode = WAL')
    this.db.pragma('synchronous = FULL')
    this.db.pragma('fullfsync = ON')

    this.version = this.db.pragma('user_version')

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

  close() {
    this.db.close()
  }
}
