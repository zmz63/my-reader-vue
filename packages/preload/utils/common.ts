import _path from 'path/posix'
import _crypto from 'crypto'
import _fs from 'fs-extra'
import { getPath } from '@preload/channel/app'

export function openFile(path: string) {
  return _fs.readFile(path)
}

export async function getBookCachePath() {
  const userDataPath = await getPath('userData')

  return _path.join(userDataPath, 'book_cache')
}

export function md5(buffer: Buffer): string
export function md5(path: string): Promise<string>
export function md5(input: Buffer | string) {
  if (typeof input === 'string') {
    return new Promise<string>((resolve, reject) => {
      const stream = _fs.createReadStream(input, { highWaterMark: 512 })
      const hash = _crypto.createHash('md5')

      stream.on('data', chunk => hash.update(chunk))

      stream.on('end', () => resolve(hash.digest('hex')))

      stream.on('error', error => reject(error))
    })
  } else {
    const hash = _crypto.createHash('md5')

    hash.update(input)

    return hash.digest('hex')
  }
}

export function randomUUID() {
  return _crypto.randomUUID()
}
