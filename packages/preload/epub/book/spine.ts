import { Hook } from '@common/hook'
import type { ZipArchive } from '@preload/utils/zip-archive'
import { CFI } from '..'
import type { Container } from './container'
import type { Package } from './package'
import { Section } from './section'

export class Spine {
  sections: Section[] = []

  hrefMap: Record<string, number> = {}

  totalWords = -1

  readonly hooks: Readonly<{
    serialize: Hook<(section: Section) => void>
    countWords: Hook<(words: number) => void>
  }> = {
    serialize: new Hook(),
    countWords: new Hook()
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
    const max = Math.floor(5000 / spine.length)
    const countWordsQueue: Promise<number>[] = []

    for (const item of spine) {
      const index = item.index
      const manifestItem = manifest[item.idref]
      const href = container.resolve(manifestItem.href)
      const document = await archive.getDocument(href)

      const section = new Section(
        inst,
        index,
        item.linear === 'yes',
        href,
        manifestItem.type,
        item.properties,
        CFI.generateBase(spineNodeIndex, index, item.id),
        document
      )

      countWordsQueue.push(section.countWords(max))

      inst.sections[index] = section

      inst.hrefMap[href] = index
      inst.hrefMap[href] = index
      inst.hrefMap[href] = index
    }

    Promise.all(countWordsQueue).then(list => {
      inst.totalWords = list.reduce((prev, value) => prev + value, 0)
      inst.hooks.countWords.trigger(inst.totalWords)
    })
  }
}
