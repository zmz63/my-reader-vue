import _fs from 'fs-extra'
import yauzl from 'yauzl'
import yazl from 'yazl'
import { Defer } from '@packages/common/defer'

export function buffersToZipFile(path: string, buffers: DataChunk<Buffer>[]) {
  const zipFile = new yazl.ZipFile()

  for (const { name, data } of buffers) {
    zipFile.addBuffer(data, name)
  }

  zipFile.end()

  return new Promise<void>((resolve, reject) => {
    const outputStream = zipFile.outputStream

    outputStream.pipe(_fs.createWriteStream(path))

    outputStream.on('end', () => {
      resolve()
    })

    outputStream.on('error', () => {
      reject()
    })
  })
}

export function buffersToZipFileBuffer(buffers: DataChunk<Buffer>[]) {
  const zipFile = new yazl.ZipFile()

  for (const { name, data } of buffers) {
    zipFile.addBuffer(data, name)
  }

  zipFile.end()

  const chunks: Buffer[] = []

  return new Promise<Buffer>((resolve, reject) => {
    const outputStream = zipFile.outputStream

    outputStream.on('data', chunk => {
      chunks.push(chunk)
    })

    outputStream.on('end', () => {
      const data = Buffer.concat(chunks)
      resolve(data)
    })

    outputStream.on('error', error => {
      reject(error)
    })
  })
}

export type ZipEntries = Record<string, yauzl.Entry>

export class ZipArchive {
  file: yauzl.ZipFile | null = null

  entries: ZipEntries = {}

  opened = new Defer<void>()

  constructor(path: string) {
    yauzl.open(path, { autoClose: false, lazyEntries: false }, (error, zipFile) => {
      if (error) {
        this.opened.reject(error)
      }

      this.file = zipFile

      zipFile.on('entry', entry => {
        if (!/\/$/.test(entry.fileName)) {
          this.entries[entry.fileName] = entry
        }
      })

      zipFile.on('end', async () => {
        this.opened.resolve()
      })
    })
  }

  async getBuffer(path: string) {
    await this.opened.promise

    return new Promise<Buffer>((resolve, reject) => {
      if (!this.file || !this.entries[path]) return reject()

      const chunks: Buffer[] = []

      this.file.openReadStream(this.entries[path], (error, readStream) => {
        if (error) reject(error)

        readStream.on('data', chunk => {
          chunks.push(chunk)
        })

        readStream.on('end', () => {
          const data = Buffer.concat(chunks)
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

  async close() {
    await this.opened.promise

    this.file?.close()
  }
}
