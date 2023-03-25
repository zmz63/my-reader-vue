import { Hook } from '@common/hook'
import type { ZipArchive } from '@preload/utils/zip-archive'
import { CFI } from '..'
import type { Container } from './container'
import type { Package } from './package'
import { Section } from './section'

export class Spine {
  sections: Section[] = []

  hrefMap: Record<string, number> = {}

  idMap: Record<string, number> = {}

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
      if (CFI.isCFI(target)) {
        //
      } else if (target.indexOf('#') === 0) {
        index = this.idMap[target.substring(1)] || -1
      } else {
        target = target.split('#')[0]
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

      const sectionDocument = await archive.getDocument(container.resolve(manifestItem.href))

      const section = new Section(
        inst,
        index,
        item.linear === 'yes',
        manifestItem.href,
        manifestItem.type,
        item.properties,
        CFI.generateChapterFragment(spineNodeIndex, index, item.id),
        sectionDocument
      )

      inst.sections[index] = section

      inst.hrefMap[decodeURI(manifestItem.href)] = index
      inst.hrefMap[encodeURI(manifestItem.href)] = index
      inst.hrefMap[manifestItem.href] = index

      inst.idMap[item.idref] = index
    }
  }
}
