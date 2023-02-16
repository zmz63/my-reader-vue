import type { ZipArchive } from '@preload/utils/zip'
import type { Manifest, ManifestItem } from './package'

type Resource = Simplify<ManifestItem & { buffer: Promise<Buffer> }>

export class Resources {
  htmlList: Resource[] = []

  cssList: Resource[] = []

  assets: Resource[] = []

  async unpack(manifest: Manifest, zipArchive: ZipArchive, resolve: (path: string) => string) {
    for (const item of Object.values(manifest)) {
      const resource = { ...item, buffer: zipArchive.getBuffer(resolve(item.href)) }
      if (item.type === 'application/xhtml+xml' || item.type === 'text/html') {
        this.htmlList.push(resource)
      } else if (item.type === 'text/css') {
        this.cssList.push(resource)
      } else {
        this.assets.push(resource)
      }
    }
  }
}
