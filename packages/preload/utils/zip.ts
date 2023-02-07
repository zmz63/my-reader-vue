import _fs from 'fs-extra'
import yauzl from 'yauzl'
import yazl from 'yazl'

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

// export function openZipFile(
//   path: string,
//   callback: (
//     error: Error | null,
//     zipFile: yauzl.ZipFile,
//     entries: Record<string, yauzl.Entry> | null
//   ) => Promise<void>
// ) {
//   yauzl.open(path, { autoClose: false, lazyEntries: false }, async (error, zipFile) => {
//     if (error) {
//       return callback(error, zipFile, null)
//     }

//     const entries: Record<string, yauzl.Entry> = {}

//     zipFile.on('entry', entry => {
//       if (!/\/$/.test(entry.fileName)) {
//         entries[entry.fileName] = entry
//       }
//     })

//     zipFile.on('end', async () => {
//       callback(null, zipFile, entries).finally(() => {
//         zipFile.close()
//       })
//     })
//   })
// }

export type ZipEntries = Record<string, yauzl.Entry>

export function openZipFile(path: string) {
  const entries: ZipEntries = {}

  return new Promise<{ zipFile: yauzl.ZipFile; entries: ZipEntries }>((resolve, reject) => {
    yauzl.open(path, { autoClose: false, lazyEntries: false }, (error, zipFile) => {
      if (error) {
        reject(error)
      }

      zipFile.on('entry', entry => {
        if (!/\/$/.test(entry.fileName)) {
          entries[entry.fileName] = entry
        }
      })

      zipFile.on('end', async () => {
        resolve({ zipFile, entries })
      })
    })
  })
}

export function zipFileEntryToBuffer(zipFile: yauzl.ZipFile, entry: yauzl.Entry) {
  const chunks: Buffer[] = []

  return new Promise<Buffer>((resolve, reject) => {
    zipFile.openReadStream(entry, (error, readStream) => {
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
