/* eslint-disable @typescript-eslint/no-explicit-any */
import { basename, relative } from 'path'
import yauzl from 'yauzl'
import type { Entry, ZipFile } from 'yauzl'

export function swap<T>(array: Readwrite<ArrayLike<T>>, left: number, right: number) {
  const temp = array[left]
  array[left] = array[right]
  array[right] = temp
}

export function clamp(lower: number, upper: number, value: number) {
  return Math.max(lower, Math.min(upper, value))
}

export function extend<T extends Record<string, unknown>>(
  target: Partial<T> | undefined,
  source: T
) {
  if (!target) {
    return { ...source }
  }

  for (const key in source) {
    if (target[key] === undefined) {
      target[key] = source[key]
    }
  }

  return target as T
}

export function loadZipFile(
  path: string,
  callback: (
    error: Error | null,
    zipfile: ZipFile,
    entrys: Record<string, Entry> | null
  ) => Promise<void>
) {
  yauzl.open(path, { autoClose: false, lazyEntries: false }, async (error, zipfile) => {
    if (error) {
      return callback(error, zipfile, null)
    }

    const entrys: Record<string, Entry> = {}

    zipfile.on('entry', entry => {
      if (!/\/$/.test(entry.fileName)) {
        entrys[entry.fileName] = entry
      }
    })

    zipfile.once('end', async () => {
      callback(null, zipfile, entrys).finally(() => {
        zipfile.close()
      })
    })
  })
}

export function readZipFileToBuffer(zipfile: ZipFile, entry: Entry) {
  return new Promise<Buffer>((resolve, reject) => {
    zipfile.openReadStream(entry, (error, readStream) => {
      if (error) reject(error)

      const buffers: Buffer[] = []

      readStream.on('data', chunk => {
        buffers.push(chunk)
      })

      readStream.on('end', () => {
        const data = Buffer.concat(buffers)
        resolve(data)
      })

      readStream.on('error', error => {
        reject(error)
      })
    })
  })
}

export function readZipFileToText(zipfile: ZipFile, entry: Entry) {
  return readZipFileToBuffer(zipfile, entry).then(buffer => {
    const decoder = new TextDecoder()
    return decoder.decode(buffer)
  })
}

export function getXmlObjectData(
  content: any,
  attribute = '#text',
  callback?: (item: any, index?: number) => boolean
) {
  if (typeof content === 'object') {
    if (Array.isArray(content)) {
      if (callback) {
        for (let i = 0; i < content.length; i++) {
          if (callback(content[i], i)) {
            return content[i][attribute] || ''
          }
        }
      } else {
        return content[0]
      }
    } else {
      return content[attribute] || ''
    }
  }

  return ''
}

export function replace(content: string, matches: string[], replacer: (match: string) => string) {
  matches = Array.from(matches)

  for (let i = 0; i < matches.length; i++) {
    matches[i] = `(${matches[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`
  }

  return content.replace(new RegExp(matches.join('|'), 'g'), replacer)
}

export function replaceLink(href: string, content: string, urls: string[], blobUrls: string[]) {
  const matches: string[] = []
  const replacements: Record<string, string> = {}

  for (let i = 0; i < urls.length; i++) {
    const url = relative(basename(href), urls[i]).replace(/[\\]/g, '/')
    matches.push(url)
    replacements[url] = blobUrls[i]
  }

  return replace(content, matches, match => replacements[match])
}

export function overrideStyles(
  element: HTMLElement,
  styles: Record<string, string>,
  important = true
) {
  const values: string[] = []

  for (const key in styles) {
    values.push(`${key}: ${styles[key]}`)
  }

  values.push('')

  element.setAttribute('style', values.join(important ? ' !important;' : ';'))
}

// export function replace(content: string, urls: string[], replacements: string[]) {
//   for (const index in urls) {
//     const url = urls[index].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
//     const replacement = replacements[index]
//     content = content.replace(new RegExp(url, 'g'), replacement)
//   }

//   return content
// }

// export function replaceLink(href: string, content: string, urls: string[], blobUrls: string[]) {
//   return replace(
//     content,
//     urls.map(url => relative(basename(href), url).replace(/[\\]/g, '/')),
//     blobUrls
//   )
// }
