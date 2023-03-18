import yauzl from 'yauzl'
import { Defer } from '@common/defer'

export type ZipEntries = Record<string, yauzl.Entry>

export class ZipArchive {
  file: yauzl.ZipFile | null = null

  entries: ZipEntries = {}

  buffers: Record<string, Buffer> = {}

  domParser = new DOMParser()

  opened: Promise<void>

  private defer = {
    opened: new Defer<void>()
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
          this.entries[entry.fileName] = entry
        }
      })

      zipFile.on('end', async () => {
        this.defer.opened.resolve()
      })
    }

    if (typeof input === 'string') {
      yauzl.open(input, options, callback)
    } else {
      yauzl.fromBuffer(input, options, callback)
    }
  }

  async getBuffer(path: string) {
    if (this.buffers[path]) {
      return this.buffers[path]
    }

    await this.opened

    return new Promise<Buffer>((resolve, reject) => {
      if (!this.file || !this.entries[path]) {
        // TODO
        return reject()
      }

      const chunks: Buffer[] = []

      this.file.openReadStream(this.entries[path], (error, readStream) => {
        if (error) reject(error)

        readStream.on('data', chunk => {
          chunks.push(chunk)
        })

        readStream.on('end', () => {
          const data = Buffer.concat(chunks)
          this.buffers[path] = data
          resolve(data)
        })

        readStream.on('error', error => {
          reject(error)
        })
      })
    })
  }

  async getText(path: string) {
    const buffer = await this.getBuffer(path)

    return buffer.toString('utf8')
  }

  async getBlob(path: string, type?: string) {
    const buffer = await this.getBuffer(path)

    return new Blob([buffer], { type })
  }

  async getXMLDocument(path: string) {
    const text = await this.getText(path)

    return this.domParser.parseFromString(text, 'application/xml') as XMLDocument
  }

  async getDocument(path: string) {
    const text = await this.getText(path)

    return this.domParser.parseFromString(text, 'application/xhtml+xml') as Document
  }

  async close() {
    await this.opened

    this.file?.close()
  }
}
