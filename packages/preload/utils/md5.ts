import _crypto from 'crypto'
import _fs from 'fs-extra'

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
