import _path from 'path/posix'
import { ZipArchive } from '@preload/utils/zip-archive'
import { Defer } from '@packages/common/defer'
import { Container } from './container'
import { Package } from './package'
import { Spine } from './spine'
import { Resources } from './resources'

const CONTAINER_PATH = 'META-INF/container.xml'

export type EPubOpenOptions = {
  dump: boolean
}

export class EPub {
  path = ''

  opened = new Defer<void>()

  container = new Container()

  package = new Package()

  spine = new Spine()

  resources = new Resources()

  constructor(path?: string, options?: Partial<EPubOpenOptions>) {
    if (path) {
      this.open(path, options)
    }
  }

  async open(path: string, options?: Partial<EPubOpenOptions>) {
    try {
      const archive = new ZipArchive(path)

      const containerDocument = await archive.getXMLDocument(CONTAINER_PATH)
      await this.container.parse(containerDocument)

      const packageDocument = await archive.getXMLDocument(this.container.packagePath)
      await this.package.parse(packageDocument)

      const resolver = (path: string) => _path.join(this.container.directory, path)

      await this.resources.unpack(this.package.manifest, archive, resolver)

      await this.spine.unpack(this.package, archive, resolver)

      this.spine.hooks.serialize.register((content, section) => {
        section.content = this.resources.replace(content, section.url)
      })

      if (options && options.dump) {
        // TODO
      }

      this.path = path
      this.opened.resolve()
      archive.close()
    } catch (error) {
      this.opened.reject(error)
    }
  }

  dump() {
    // TODO
  }

  destroy() {
    this.spine.destroy()
    this.resources.destroy()
  }
}

declare global {
  interface Window {
    EPub: typeof EPub
  }
  class EPub {
    path: string

    opened: Defer<void>

    container: Container

    package: Package

    constructor(path?: string, options?: Partial<EPubOpenOptions>)

    open(path: string, options?: Partial<EPubOpenOptions>): Promise<void>

    resolve(path: string): string
  }
}
