import { Defer } from '@packages/common/defer'
import { ZipArchive } from '@preload/utils/zip-archive'
import { Container } from './container'
import { Package } from './package'
import { Spine } from './spine'
import { Resources } from './resources'
import { Navigation } from './navigation'

const CONTAINER_PATH = 'META-INF/container.xml'

export type OpenOptions = {
  unpack: boolean
}

export class Book {
  path: string

  container = new Container()

  package = new Package()

  spine = new Spine()

  resources = new Resources()

  navigation = new Navigation()

  opened: Promise<void>

  unpacked: Promise<void>

  private defer = {
    opened: new Defer<void>(),
    unpacked: new Defer<void>()
  }

  constructor(path: string, options?: Partial<OpenOptions>) {
    this.path = path
    this.opened = this.defer.opened.promise
    this.unpacked = this.defer.unpacked.promise

    this.open(path, options)
  }

  private async open(path: string, options?: Partial<OpenOptions>) {
    try {
      const archive = new ZipArchive(path)

      await Container.parse(this.container, archive, CONTAINER_PATH)
      await Package.parse(this.package, archive, this.container)

      this.defer.opened.resolve()

      if (options && options.unpack) {
        await Resources.unpack(this.resources, archive, this.package.manifest, this.container)
        await Spine.unpack(this.spine, archive, this.package, this.container)

        if (this.package.ncxPath) {
          await Navigation.parseNcx(
            this.navigation,
            archive,
            this.container.resolve(this.package.ncxPath)
          )
        } else if (this.package.navPath) {
          await Navigation.parseNav(
            this.navigation,
            archive,
            this.container.resolve(this.package.navPath)
          )
        }

        this.spine.hooks.serialize.register((content, section) => {
          section.content = this.resources.replace(content, section.href)
        })

        this.defer.unpacked.resolve()
      }

      console.log(this)

      archive.close()
    } catch (error) {
      this.defer.opened.reject(error)
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
