import _path from 'path/posix'
import { ZipArchive } from '@preload/utils/zip'
import { Defer } from '@packages/common/defer'
import { Container } from './container'
import { Package } from './package'
import { Resources } from './resources'

const CONTAINER_PATH = 'META-INF/container.xml'

export type EPubOpenOptions = {
  dump: boolean
}

export class EPub {
  container = new Container()

  package = new Package()

  resources = new Resources()

  path = ''

  opened = new Defer<void>()

  constructor(path?: string, options?: Partial<EPubOpenOptions>) {
    if (path) {
      this.open(path, options)
    }
  }

  async open(path: string, options?: Partial<EPubOpenOptions>) {
    try {
      const zipArchive = new ZipArchive(path)

      const domParser = new DOMParser()

      const containerDocument = domParser.parseFromString(
        await zipArchive.getText(CONTAINER_PATH),
        'application/xml'
      ) as XMLDocument
      await this.container.parse(containerDocument)

      const packageDocument = domParser.parseFromString(
        await zipArchive.getText(this.container.packagePath),
        'application/xml'
      ) as XMLDocument
      await this.package.parse(packageDocument)

      await this.resources.unpack(this.package.manifest, zipArchive, this.resolve)

      if (options && options.dump) {
        // TODO
      }

      this.path = path
      this.opened.resolve()

      zipArchive.close()
    } catch (error) {
      this.opened.reject(error)
    }
  }

  resolve = (path: string) => _path.join(this.container.directory, path)

  dump() {
    // TODO
  }

  destroy() {
    // TODO
  }
}

declare global {
  interface Window {
    EPub: typeof EPub
  }
  class EPub {
    container: Container

    package: Package

    path: string

    opened: Defer<void>

    constructor(path?: string, options?: Partial<EPubOpenOptions>)

    open(path: string, options?: Partial<EPubOpenOptions>): Promise<void>

    resolve(path: string): string
  }
}
