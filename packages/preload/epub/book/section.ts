import type { SpineItem } from './package'
import type { Spine } from './spine'

export class Section {
  data: Simplify<
    SpineItem & {
      type: string
      href: string
      prev: (() => Section | null) | null
      next: (() => Section | null) | null
      cfiBase: string
    }
  >

  readonly hooks: Spine['hooks']

  document: XMLDocument

  root: HTMLElement

  content = ''

  blobUrl = ''

  constructor(data: Section['data'], document: XMLDocument, hooks: Spine['hooks']) {
    this.data = data
    this.document = document
    this.root = document.documentElement
    this.hooks = hooks
  }

  async serialize() {
    const serializer = new XMLSerializer()
    const content = serializer.serializeToString(this.root)
    await this.hooks.serialize.trigger(content, this)

    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl)
    }

    this.blobUrl = URL.createObjectURL(new Blob([this.content], { type: this.data.type }))
  }

  destroy() {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl)
    }
  }
}
