import _path from 'path/posix'
import { ZipArchive } from '@preload/utils/zip-archive'
import { Defer } from '@packages/common/defer'
import { Container } from './container'
import { Package } from './package'
import { Spine } from './spine'
import { Resources } from './resources'
import { Navigation } from './navigation'

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

  navigation = new Navigation()

  constructor(path?: string, options?: Partial<EPubOpenOptions>) {
    if (path) {
      this.open(path, options)
    }
  }

  async open(path: string, options?: Partial<EPubOpenOptions>) {
    try {
      const archive = new ZipArchive(path)

      await this.container.parse(archive, CONTAINER_PATH)

      await this.package.parse(archive, this.container.packagePath)

      await this.unpack(archive)

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

  async unpack(archive: ZipArchive) {
    const resolver = (path: string) => _path.join(this.container.directory, path)

    await this.resources.unpack(archive, this.package.manifest, resolver)

    await this.spine.unpack(archive, this.package, resolver)

    if (this.package.ncxPath) {
      await this.navigation.parseNcx(archive, this.package.ncxPath)
    } else if (this.package.navPath) {
      await this.navigation.parseNav(archive, this.package.navPath)
    }

    this.spine.hooks.serialize.register((content, section) => {
      section.content = this.resources.replace(content, section.url)
    })
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
