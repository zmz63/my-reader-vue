import _path from 'path/posix'
import type { ZipArchive } from '@preload/utils/zip'
import type { Manifest, ManifestItem } from './package'

function replace(content: string, matches: string[], replacer: (match: string) => string) {
  matches = Array.from(matches)

  for (let i = 0; i < matches.length; i++) {
    matches[i] = `(${matches[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`
  }

  return content.replace(new RegExp(matches.join('|'), 'g'), replacer)
}

export class Resources {
  cssList: Simplify<ManifestItem & { data: string; replaced: boolean }>[] = []

  assets: Simplify<ManifestItem & { data: Blob }>[] = []

  urls: string[] = []

  async unpack(manifest: Manifest, zipArchive: ZipArchive, resolve: (path: string) => string) {
    for (const item of Object.values(manifest)) {
      if (item.type !== 'application/xhtml+xml' && item.type !== 'text/html') {
        if (item.type === 'text/css') {
          const data = await zipArchive.getText(resolve(item.href))
          this.cssList.push({ ...item, data, replaced: false })
        } else {
          const blob = await zipArchive.getBlob(resolve(item.href), item.type)
          this.assets.push({ ...item, data: blob })
          this.urls.push(URL.createObjectURL(blob))
        }
      }
    }
  }

  replace(path: string, content: string) {
    const matches: string[] = []
    const replacements: Record<string, string> = {}

    for (let i = 0; i < this.urls.length; i++) {
      const url = _path.relative(_path.basename(path), this.assets[i].href)
      matches.push(url)
      replacements[url] = this.urls[i]
    }

    return replace(content, matches, match => replacements[match])
  }

  destroy() {
    for (const url of this.urls) {
      URL.revokeObjectURL(url)
    }
  }
}
