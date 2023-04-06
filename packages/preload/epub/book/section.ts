import type { Spine } from './spine'

export class Section {
  spine: Spine

  index: number

  linear: boolean

  type: string

  href: string

  properties: string[]

  cfiBase: string

  document: XMLDocument

  content = ''

  blobUrl = ''

  words = -1

  constructor(
    spine: Spine,
    index: number,
    linear: boolean,
    href: string,
    type: string,
    properties: string[],
    cfiBase: string,
    document: XMLDocument
  ) {
    this.spine = spine
    this.index = index
    this.linear = linear
    this.href = href
    this.type = type
    this.properties = properties
    this.cfiBase = cfiBase
    this.document = document
  }

  async serialize() {
    if (this.blobUrl) {
      return
    }

    await this.spine.hooks.serialize.trigger(this)

    const serializer = new XMLSerializer()

    this.content = serializer.serializeToString(this.document.documentElement)

    this.blobUrl = URL.createObjectURL(new Blob([this.content], { type: this.type }))
  }

  countWords(max = 1000) {
    return new Promise<number>(resolve => {
      const treeWalker = this.document.createTreeWalker(this.document.body, NodeFilter.SHOW_TEXT)

      let n = 0
      let words = 0
      let node: Node | null

      const walk = () => {
        do {
          node = treeWalker.nextNode()
          n += 1

          if (node) {
            words += (node.textContent as string).length

            if (n >= max) {
              n = 0
              requestAnimationFrame(walk)

              break
            }
          } else {
            this.words = words
            resolve(words)
          }
        } while (node)
      }

      walk()
    })
  }

  prev() {
    if (!this.linear) {
      return null
    }

    let prevIndex = this.index - 1
    while (prevIndex >= 0) {
      const prev = this.spine.get(prevIndex)
      if (prev && prev.linear) {
        return prev
      }
      prevIndex -= 1
    }

    return null
  }

  next() {
    if (!this.linear) {
      return null
    }

    let nextIndex = this.index + 1
    while (nextIndex < this.spine.sections.length) {
      const next = this.spine.get(nextIndex)
      if (next && next.linear) {
        return next
      }
      nextIndex += 1
    }

    return null
  }

  destroy() {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl)
    }
  }
}
