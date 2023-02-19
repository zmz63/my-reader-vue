import { Hook } from '@packages/common/hook'
import type { ZipArchive } from '@preload/utils/zip-archive'
import type { Package } from './package'
import { Section, type SectionData } from './section'

function replaceBase(document: Document, url: string) {
  const head = document.querySelector('head')

  if (!head) {
    return
  }

  let base = head.querySelector('base')

  if (!base) {
    base = document.createElement('base')
    head.insertBefore(base, head.firstChild)
  }

  base.setAttribute('href', url)
}

export type SpineHooks = {
  serialize: Hook<[string, Section]>
}

export class Spine {
  sections: Section[] = []

  hrefMap: Record<string, number> = {}

  idMap: Record<string, number> = {}

  hooks: SpineHooks = {
    serialize: new Hook<[string, Section]>()
  }

  async unpack(
    archive: ZipArchive,
    { spine, manifest }: Package,
    resolver: (path: string) => string
  ) {
    for (const item of spine) {
      const index = item.index
      const manifestItem = manifest[item.idref]
      const url = resolver(manifestItem.href)

      const sectionData: SectionData = {
        ...item,
        type: manifestItem.type,
        href: manifestItem.href,
        url,
        prev: null,
        next: null,
        document: await archive.getDocument(url)
      }

      replaceBase(sectionData.document, url)

      if (sectionData.linear === 'yes') {
        sectionData.prev = () => {
          let prevIndex = index - 1
          while (prevIndex >= 0) {
            const prev = this.get(prevIndex)
            if (prev && prev.linear) {
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
            if (next && next.linear) {
              return next
            }
            nextIndex += 1
          }
          return null
        }
      }

      const section = new Section(sectionData, this.hooks)
      this.sections[index] = section
      this.hrefMap[decodeURI(section.href)] = index
      this.hrefMap[encodeURI(section.href)] = index
      this.hrefMap[section.href] = index
      this.idMap[section.idref] = index
    }
  }

  get(index: number) {
    return this.sections[index]
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
