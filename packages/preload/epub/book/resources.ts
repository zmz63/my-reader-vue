import _path from 'path/posix'
import type { ZipArchive } from '@preload/utils/zip-archive'
import type { ManifestItem } from './package'
import type { Container } from './container'

type Asset = Simplify<
  ManifestItem & {
    data: Blob
    url: string
  }
>

export class Resources {
  assets: Asset[] = []

  replace(content: string, path: string, substrings: string[] = []) {
    const map: Record<string, string> = {}

    for (const asset of this.assets) {
      const url = _path.relative(_path.dirname(path), asset.href)
      map[url] = asset.url
      substrings.push(`(${url.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`)
    }

    return content.replace(new RegExp(substrings.join('|'), 'g'), substring => map[substring] || '')
  }

  destroy() {
    for (const asset of this.assets) {
      URL.revokeObjectURL(asset.url)
    }

    this.assets = []
  }

  static async unpack(
    inst: Resources,
    archive: ZipArchive,
    manifest: Record<string, ManifestItem>,
    container: Container
  ) {
    const cssList: Simplify<ManifestItem & { data: string }>[] = []

    for (const item of Object.values(manifest)) {
      if (item.type !== 'application/xhtml+xml' && item.type !== 'text/html') {
        if (item.type === 'text/css') {
          const data = await archive.getText(container.resolve(item.href))
          cssList.push({ ...item, data })
        } else {
          const blob = await archive.getBlob(container.resolve(item.href), item.type)
          inst.assets.push({ ...item, data: blob, url: URL.createObjectURL(blob) })
        }
      }
    }

    const replaceCss = (index = 0) => {
      if (index >= cssList.length) {
        return
      }

      const css = cssList[index]
      if (css.data) {
        const substrings: string[] = []
        const map: Record<string, number> = {}

        for (let i = 0; i < cssList.length; i++) {
          const url = _path.relative(_path.dirname(css.href), cssList[i].href)
          map[url] = i
          substrings.push(`(${url.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`)
        }

        const matches = css.data.match(new RegExp(substrings.join('|'), 'g'))

        if (matches) {
          for (const match of matches) {
            replaceCss(map[match])
          }
        }

        const content = inst.replace(css.data, css.href)
        const blob = new Blob([content], { type: css.type })

        inst.assets.push({
          href: css.href,
          overlay: css.overlay,
          properties: css.properties,
          type: css.type,
          data: blob,
          url: URL.createObjectURL(blob)
        })

        css.data = ''
      }

      replaceCss(index + 1)
    }

    replaceCss()
  }
}
