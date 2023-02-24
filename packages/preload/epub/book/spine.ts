import { Hook } from '@packages/common/hook'
import type { ZipArchive } from '../zip-archive'
import { CFI } from '../cfi'
import { replaceBase } from '../utils'
import type { Package } from './package'
import { Section, type SectionData } from './section'

export type SpineHooks = {
  serialize: Hook<(content: string, section: Section) => void>
}

export class Spine {
  private sections: Section[] = []

  private hrefMap: Record<string, number> = {}

  private idMap: Record<string, number> = {}

  hooks: SpineHooks = {
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
      const url = resolver(manifestItem.href)

      const sectionDocument = await archive.getDocument(url)
      const sectionData: SectionData = {
        ...item,
        type: manifestItem.type,
        href: manifestItem.href,
        url,
        prev: null,
        next: null,
        cfiBase: CFI.generateChapterFragment(spineNodeIndex, index, item.id)
      }

      replaceBase(sectionDocument, url)

      if (sectionData.linear === 'yes') {
        sectionData.prev = () => {
          let prevIndex = index - 1
          while (prevIndex >= 0) {
            const prev = this.get(prevIndex)
            if (prev && prev.data.linear) {
              return prev
            }
            prevIndex -= 1
          }
          return null
        }
        sectionData.next = () => {
          let nextIndex = index + 1
          while (nextIndex < this.sections.length) {
            const next = this.get(nextIndex)
            if (next && next.data.linear) {
              return next
            }
            nextIndex += 1
          }
          return null
        }
      }

      const section = new Section(sectionData, sectionDocument, this.hooks)

      this.sections[index] = section

      this.hrefMap[decodeURI(sectionData.href)] = index
      this.hrefMap[encodeURI(sectionData.href)] = index
      this.hrefMap[sectionData.href] = index

      this.idMap[sectionData.idref] = index
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
      if (section && section.data.linear) {
        return section
      }
    }
  }

  last() {
    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = this.sections[i]
      if (section && section.data.linear) {
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
