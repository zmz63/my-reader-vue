/* eslint-disable @typescript-eslint/no-explicit-any */
import _path from 'path'
import Sqlite3 from 'better-sqlite3'
import v1 from './schemas/v1'
import v2 from './schemas/v2'
import v3 from './schemas/v3'

export type DBPayload = {
  source: string
  params?: any[]
}

const DATABASE_PATH = __DEV__ ? './temp/reader.db' : './reader.db'

const SCHEMAS = [v1, v2, v3]

const SCHEMA_VERSION = SCHEMAS.length

export class Server {
  db: Sqlite3.Database

  version = 0

  constructor() {
    this.db = new Sqlite3(DATABASE_PATH, {
      verbose: __DEV__ ? message => console.log(message) : undefined,
      nativeBinding: __DEV__
        ? './lib/better_sqlite3.node'
        : _path.resolve(__dirname, '../lib/better_sqlite3.node')
    })

    this.db.pragma('journal_mode = WAL')
    this.db.pragma('synchronous = FULL')
    this.db.pragma('fullfsync = ON')
    this.db.pragma('foreign_keys = ON')

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
