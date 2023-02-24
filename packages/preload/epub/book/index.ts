import _path from 'path/posix'
import { Defer } from '@packages/common/defer'
import { ZipArchive } from '../zip-archive'
import { Container } from './container'
import { Package } from './package'
import { Spine } from './spine'
import { Resources } from './resources'
import { Navigation } from './navigation'

const CONTAINER_PATH = 'META-INF/container.xml'

export type OpenOptions = {
  dump: boolean
}

export class Book {
  path = ''

  container = new Container()

  package = new Package()

  spine = new Spine()

  resources = new Resources()

  navigation = new Navigation()

  opened: Promise<void>

  private defer = {
    opened: new Defer<void>()
  }

  constructor(path?: string, options?: Partial<OpenOptions>) {
    this.opened = this.defer.opened.promise

    if (path) {
      this.open(path, options)
    }
  }

  async open(path: string, options?: Partial<OpenOptions>) {
    try {
      const archive = new ZipArchive(path)

      await this.container.parse(archive, CONTAINER_PATH)

      await this.package.parse(archive, this.container.packagePath)

      await this.unpack(archive)

      if (options && options.dump) {
        // TODO
      }

      this.path = path
      this.defer.opened.resolve()

      archive.close()
    } catch (error) {
      this.defer.opened.reject(error)
    }
  }

  private async unpack(archive: ZipArchive) {
    const resolver = (path: string) => _path.join(this.container.directory, path)

    await this.resources.unpack(archive, this.package.manifest, resolver)

    await this.spine.unpack(archive, this.package, resolver)

    if (this.package.ncxPath) {
      await this.navigation.parseNcx(archive, resolver(this.package.ncxPath))
    } else if (this.package.navPath) {
      await this.navigation.parseNav(archive, resolver(this.package.navPath))
    }

    this.spine.hooks.serialize.register((content, section) => {
      section.content = this.resources.replace(content, section.data.url)
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
