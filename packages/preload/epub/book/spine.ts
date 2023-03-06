import { Hook } from '@packages/common/hook'
import type { ZipArchive } from '../zip-archive'
import { CFI } from '../cfi'
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

  async unpack(
    archive: ZipArchive,
    { spine, manifest, spineNodeIndex }: Package,
    resolver: (path: string) => string
  ) {
    for (const item of spine) {
      const index = item.index
      const manifestItem = manifest[item.idref]

      const sectionDocument = await archive.getDocument(resolver(manifestItem.href))

      const section = new Section(
        this,
        index,
        item.linear === 'yes',
        manifestItem.href,
        manifestItem.type,
        item.properties,
        CFI.generateChapterFragment(spineNodeIndex, index, item.id),
        sectionDocument
      )

      this.sections[index] = section

      this.hrefMap[decodeURI(manifestItem.href)] = index
      this.hrefMap[encodeURI(manifestItem.href)] = index
      this.hrefMap[manifestItem.href] = index

      this.idMap[item.idref] = index
    }
  }

  get(target: number | string) {
    let index = -1
    if (typeof target === 'number') {
      index = target
    } else if (target.indexOf('#') === 0) {
      index = this.idMap[target.substring(1)] || -1
    } else {
      index = this.hrefMap[target] || -1
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
}
