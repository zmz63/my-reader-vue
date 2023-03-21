import _fs from 'fs-extra'
import { Defer } from '@common/defer'
import { ZipArchive } from '@preload/utils/zip-archive'
import { md5 } from '@preload/utils/md5'
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
  path = ''

  md5 = ''

  file: Buffer | null = null

  archive: ZipArchive | null = null

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

  constructor(path: string, options?: Partial<OpenOptions>)

  constructor(file: Buffer, options?: Partial<OpenOptions>)

  constructor(target: string | Buffer, options?: Partial<OpenOptions>) {
    this.opened = this.defer.opened.promise
    this.unpacked = this.defer.unpacked.promise

    if (typeof target === 'string') {
      this.path = target

      this.open(target, options)
    } else {
      this.open(target, options)
    }
  }

  private async open(path: string, options?: Partial<OpenOptions>): Promise<void>

  private async open(file: Buffer, options?: Partial<OpenOptions>): Promise<void>

  private async open(target: string | Buffer, options?: Partial<OpenOptions>) {
    try {
      if (typeof target === 'string') {
        this.file = await _fs.readFile(target)
      } else {
        this.file = target
      }

      this.md5 = md5(this.file)
      this.archive = new ZipArchive(this.file)

      await Container.parse(this.container, this.archive, CONTAINER_PATH)
      await Package.parse(this.package, this.archive, this.container)

      this.defer.opened.resolve()

      if (options && options.unpack) {
        await Resources.unpack(this.resources, this.archive, this.package.manifest, this.container)
        await Spine.unpack(this.spine, this.archive, this.package, this.container)

        if (this.package.ncxPath) {
          await Navigation.parseNcx(
            this.navigation,
            this.archive,
            this.container.resolve(this.package.ncxPath)
          )
        } else if (this.package.navPath) {
          await Navigation.parseNav(
            this.navigation,
            this.archive,
            this.container.resolve(this.package.navPath)
          )
        }

        this.spine.hooks.serialize.register((content, section) => {
          section.content = this.resources.replace(content, section.href)
        })

        this.defer.unpacked.resolve()
      }

      console.log(this)

      await this.archive.close()

      this.archive = null
      this.file = null
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
