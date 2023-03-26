import type { Spine } from './spine'

export class Section {
  spine: Spine

  index: number

  linear: boolean

  type: string

  href: string

  properties: string[]

  cfiBase: string

  // document: XMLDocument

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
    // document: XMLDocument
    content: string
  ) {
    this.spine = spine
    this.index = index
    this.linear = linear
    this.href = href
    this.type = type
    this.properties = properties
    this.cfiBase = cfiBase
    // this.document = document
    this.content = content
  }

  async serialize() {
    if (this.blobUrl) {
      return
    }

    // const serializer = new XMLSerializer()
    // const content = serializer.serializeToString(this.document.documentElement)

    // await this.spine.hooks.serialize.trigger(content, this)

    await this.spine.hooks.serialize.trigger(this.content, this)

    // if (this.blobUrl) {
    //   URL.revokeObjectURL(this.blobUrl)
    // }

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

  destroy() {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl)
    }
  }
}
