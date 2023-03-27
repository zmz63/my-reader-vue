import { Hook } from '@common/hook'
import type { ZipArchive } from '@preload/utils/zip-archive'
import { CFI } from '..'
import type { Container } from './container'
import type { Package } from './package'
import { Section } from './section'

export class Spine {
  sections: Section[] = []

  hrefMap: Record<string, number> = {}

  readonly hooks: Readonly<{
    serialize: Hook<(content: string, section: Section) => void>
  }> = {
    serialize: new Hook()
  }

  get(target?: number | string) {
    let index = -1

    if (typeof target === 'number') {
      index = target
    } else if (typeof target === 'string') {
      if (target === '') {
        return this.first()
      } else {
        index = this.hrefMap[target] || -1
      }
    } else {
      return this.first()
    }

    return this.sections[index] || null
  }

  first() {
    for (let i = 0; i < this.sections.length; i++) {
      const section = this.sections[i]
      if (section && section.linear) {
        return section
      }
    }
  }

  last() {
    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = this.sections[i]
      if (section && section.linear) {
        return section
      }
    }
  }

  destroy() {
    for (const section of this.sections) {
      section.destroy()
    }

    this.sections = []
    this.hrefMap = {}
  }

  static async unpack(
    inst: Spine,
    archive: ZipArchive,
    { spine, manifest, spineNodeIndex }: Package,
    container: Container
  ) {
    for (const item of spine) {
      const index = item.index
      const manifestItem = manifest[item.idref]
      const href = container.resolve(manifestItem.href)
      const content = await archive.getText(href)

      const section = new Section(
        inst,
        index,
        item.linear === 'yes',
        href,
        manifestItem.type,
        item.properties,
        CFI.generateBase(spineNodeIndex, index, item.id),
        content
      )

      inst.sections[index] = section

      inst.hrefMap[href] = index
      inst.hrefMap[href] = index
      inst.hrefMap[href] = index
    }
  }
}
