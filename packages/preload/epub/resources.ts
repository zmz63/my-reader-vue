import _path from 'path/posix'
import type { ZipArchive } from '@preload/utils/zip-archive'
import type { Manifest, ManifestItem } from './package'

export class Resources {
  private cssList: Simplify<ManifestItem & { data: string | Blob }>[] = []

  assets: Simplify<
    ManifestItem & {
      data: Blob
      url: string
    }
  >[] = []

  async unpack(archive: ZipArchive, manifest: Manifest, resolver: (path: string) => string) {
    for (const item of Object.values(manifest)) {
      if (item.type !== 'application/xhtml+xml' && item.type !== 'text/html') {
        if (item.type === 'text/css') {
          const data = await archive.getText(resolver(item.href))
          this.cssList.push({ ...item, data })
        } else {
          const blob = await archive.getBlob(resolver(item.href), item.type)
          this.assets.push({ ...item, data: blob, url: URL.createObjectURL(blob) })
        }
      }
    }

    this.replaceCss()
  }

  private replaceCss(index = 0) {
    if (index >= this.cssList.length) {
      return
    }

    const css = this.cssList[index]
    if (typeof css.data === 'string') {
      const substrings: string[] = []
      const map: Record<string, number> = {}

      for (let i = 0; i < this.cssList.length; i++) {
        const url = _path.relative(_path.dirname(css.href), this.cssList[i].href)
        map[url] = i
        substrings.push(`(${url.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`)
      }

      const matchList = css.data.match(new RegExp(substrings.join('|'), 'g'))

      if (matchList) {
        for (const match of matchList) {
          this.replaceCss(map[match])
        }
      }

      const content = this.replace(css.data, css.href)
      css.data = new Blob([content], { type: css.type })
      this.assets.push({ ...css, url: URL.createObjectURL(css.data) } as typeof this.assets[0])
    }

    this.replaceCss(index + 1)
  }

  replace(content: string, path: string) {
    const substrings: string[] = []
    const map: Record<string, string> = {}

    for (const asset of this.assets) {
      const url = _path.relative(_path.dirname(path), asset.href)
      map[url] = asset.url
      substrings.push(`(${url.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`)
    }

    return content.replace(new RegExp(substrings.join('|'), 'g'), substring => map[substring])
  }

  destroy() {
    for (const asset of this.assets) {
      URL.revokeObjectURL(asset.url)
    }
  }
}
