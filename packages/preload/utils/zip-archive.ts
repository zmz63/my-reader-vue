import _fs from 'fs-extra'
import _path from 'path/posix'
import yauzl from 'yauzl'
import { Defer } from '@common/defer'

export type ZipEntries = Record<string, yauzl.Entry>

export class ZipArchive {
  file: yauzl.ZipFile | null = null

  files: ZipEntries = {}

  buffers: Record<string, Buffer> = {}

  domParser = new DOMParser()

  opened: Promise<this>

  private defer = {
    opened: new Defer<this>()
  }

  constructor(input?: string | Buffer) {
    this.opened = this.defer.opened.promise

    if (input) {
      this.open(input)
    }
  }

  open(input: string | Buffer) {
    const options: yauzl.Options = {
      autoClose: false,
      lazyEntries: false
    }

    const callback = (error: Error | null, zipFile: yauzl.ZipFile) => {
      if (error) {
        this.defer.opened.reject(error)
      }

      this.file = zipFile

      zipFile.on('entry', entry => {
        if (!/\/$/.test(entry.fileName)) {
          this.files[entry.fileName] = entry
        }
      })

      zipFile.on('end', async () => {
        this.defer.opened.resolve(this)
      })
    }

    if (typeof input === 'string') {
      yauzl.open(input, options, callback)
    } else {
      yauzl.fromBuffer(input, options, callback)
    }
  }

  async dump(key: string, dumpPath: string, assert = true) {
    const path = _path.join(dumpPath, key)

    if (assert) {
      const directory = _path.dirname(path)

      if (!_fs.existsSync(directory)) {
        _fs.mkdirsSync(directory)
      }
    }

    if (this.buffers[key]) {
      _fs.writeFile(path, this.buffers[key])

      return path
    }

    await this.opened

    return new Promise<string>((resolve, reject) => {
      if (!this.file || !this.files[key]) {
        // TODO
        return reject()
      }

      const writeStream = _fs.createWriteStream(path)

      this.file.openReadStream(this.files[key], (error, readStream) => {
        if (error) reject(error)

        readStream.pipe(writeStream)

        readStream.on('end', () => {
          resolve(path)
        })

        readStream.on('error', error => {
          reject(error)
        })
      })
    })
  }

  async getBuffer(key: string) {
    if (this.buffers[key]) {
      return this.buffers[key]
    }

    await this.opened

    return new Promise<Buffer>((resolve, reject) => {
      if (!this.file || !this.files[key]) {
        // TODO
        return reject()
      }

      const chunks: Buffer[] = []

      this.file.openReadStream(this.files[key], (error, readStream) => {
        if (error) reject(error)

        readStream.on('data', chunk => {
          chunks.push(chunk)
        })

        readStream.on('end', () => {
          const data = Buffer.concat(chunks)
          this.buffers[key] = data
          resolve(data)
        })

        readStream.on('error', error => {
          reject(error)
        })
      })
    })
  }

  async getText(key: string) {
    const buffer = await this.getBuffer(key)

    return buffer.toString('utf8')
  }

  async getBlob(key: string, type?: string) {
    const buffer = await this.getBuffer(key)

    return new Blob([buffer], { type })
  }

  async getXMLDocument(key: string) {
    const text = await this.getText(key)

    return this.domParser.parseFromString(text, 'application/xml') as XMLDocument
  }

  async getDocument(key: string) {
    const text = await this.getText(key)

    return this.domParser.parseFromString(text, 'application/xhtml+xml') as Document
  }

  async close() {
    await this.opened

    this.file?.close()
  }
}
