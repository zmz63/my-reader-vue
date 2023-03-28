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

  *search(keyword: string, max: number) {
    const treeWalker = this.document.createTreeWalker(this.document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: node =>
        node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    })

    let ranges: Range[] = []

    let node: Node | null
    while ((node = treeWalker.nextNode())) {
      const result = (node.textContent as string).matchAll(new RegExp(keyword, 'g'))
      for (const match of result) {
        if (match.index !== undefined) {
          const range = this.document.createRange()
          range.setStart(node, match.index)
          range.setEnd(node, match.index + keyword.length)

          ranges.push(range)

          if (ranges.length >= max) {
            const result = ranges
            ranges = []

            yield result
          }
        }
      }
    }

    yield ranges
  }

  destroy() {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl)
    }
  }
}
