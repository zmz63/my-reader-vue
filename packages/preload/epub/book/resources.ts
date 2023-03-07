import _path from 'path/posix'
import type { ZipArchive } from '@preload/utils/zip-archive'
import type { ManifestItem } from './package'

export class Resources {
  assets: Simplify<
    ManifestItem & {
      data: Blob
      url: string
    }
  >[] = []

  async unpack(
    archive: ZipArchive,
    manifest: Record<string, ManifestItem>,
    resolver: (path: string) => string
  ) {
    const cssList: Simplify<ManifestItem & { data: string | Blob }>[] = []

    for (const item of Object.values(manifest)) {
      if (item.type !== 'application/xhtml+xml' && item.type !== 'text/html') {
        if (item.type === 'text/css') {
          const data = await archive.getText(resolver(item.href))
          cssList.push({ ...item, data })
        } else {
          const blob = await archive.getBlob(resolver(item.href), item.type)
          this.assets.push({ ...item, data: blob, url: URL.createObjectURL(blob) })
        }
      }
    }

    const replaceCss = (index = 0) => {
      if (index >= cssList.length) {
        return
      }

      const css = cssList[index]
      if (typeof css.data === 'string') {
        const substrings: string[] = []
        const map: Record<string, number> = {}

        for (let i = 0; i < cssList.length; i++) {
          const url = _path.relative(_path.dirname(css.href), cssList[i].href)
          map[url] = i
          substrings.push(`(${url.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`)
        }

        const matchList = css.data.match(new RegExp(substrings.join('|'), 'g'))

        if (matchList) {
          for (const match of matchList) {
            replaceCss(map[match])
          }
        }

        const content = this.replace(css.data, css.href)
        css.data = new Blob([content], { type: css.type })
        this.assets.push({ ...css, url: URL.createObjectURL(css.data) } as typeof this.assets[0])
      }

      replaceCss(index + 1)
    }

    replaceCss()
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
