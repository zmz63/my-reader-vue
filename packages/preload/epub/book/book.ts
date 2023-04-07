import _path from 'path/posix'
import _crypto from 'crypto'
import _fs from 'fs-extra'
import { Defer } from '@common/defer'
import { ZipArchive } from '@preload/utils/zip-archive'
import { replaceAttribute, replaceBase } from '..'
import { Container } from './container'
import { Package } from './package'
import { Spine } from './spine'
import { Navigation } from './navigation'

const CONTAINER_PATH = 'META-INF/container.xml'

export type DumpOptions = {
  path: string
}

export class Book {
  cachePath = ''

  container = new Container()

  package = new Package()

  spine = new Spine()

  navigation = new Navigation()

  opened: Promise<this>

  dumped: Promise<this>

  unpacked: Promise<this>

  private defer = {
    opened: new Defer<this>(),
    dumped: new Defer<this>(),
    unpacked: new Defer<this>()
  }

  constructor(file: Buffer, unpack: false)

  constructor(file: Buffer, unpack: true, options: DumpOptions)

  constructor(file: Buffer, unpack: boolean, options?: DumpOptions) {
    this.opened = this.defer.opened.promise
    this.dumped = this.defer.dumped.promise
    this.unpacked = this.defer.unpacked.promise

    if (unpack) {
      if (!options) {
        // TODO
        throw new Error('')
      }

      this.open(file, true, options)
    } else {
      this.open(file, false)
    }
  }

  private async open(file: Buffer, unpack: false): Promise<void>

  private async open(file: Buffer, unpack: true, options: DumpOptions): Promise<void>

  private async open(file: Buffer, unpack: boolean, options?: DumpOptions) {
    try {
      const archive = new ZipArchive(file)

      await Container.parse(this.container, archive, CONTAINER_PATH)
      console.log('---------- container loaded')
      await Package.parse(this.package, archive, this.container)
      console.log('---------- package loaded')

      this.defer.opened.resolve(this)

      if (unpack && options) {
        this.cachePath = _path.join(options.path, _crypto.randomUUID(), '/')

        await archive.opened

        this.dump(archive)
        this.unpack(archive)
      }

      await this.dumped
      await this.unpacked
      await archive.close()
    } catch (error) {
      this.defer.opened.reject(error)
    }
  }

  private async unpack(archive: ZipArchive) {
    await Spine.unpack(this.spine, archive, this.package, this.container)
    console.log('---------- spine loaded')

    if (this.package.ncxPath) {
      await Navigation.parseNcx(
        this.navigation,
        archive,
        this.container.resolve(this.package.ncxPath),
        this.spine
      )
    } else if (this.package.navPath) {
      await Navigation.parseNav(
        this.navigation,
        archive,
        this.container.resolve(this.package.navPath),
        this.spine
      )
    }
    console.log('---------- navigation loaded')

    this.spine.hooks.serialize.register(section => {
      const document = section.document

      replaceBase(document, `book-cache:///${_path.join(this.cachePath, section.href)}`)
      replaceAttribute(document, 'svg', 'preserveAspectRatio', 'xMidYMid', 'none')
    })

    this.defer.unpacked.resolve(this)
  }

  private async dump(archive: ZipArchive) {
    const promises: Promise<string>[] = []
    for (const item of Object.values(this.package.manifest)) {
      if (item.type !== 'application/xhtml+xml' && item.type !== 'text/html') {
        promises.push(archive.dump(this.container.resolve(item.href), this.cachePath))
      }
    }

    await Promise.allSettled(promises)
    console.log('---------- resources loaded')

    this.defer.dumped.resolve(this)
  }

  destroy() {
    this.spine.destroy()

    if (this.cachePath) {
      _fs.remove(this.cachePath)
    }
  }
}
