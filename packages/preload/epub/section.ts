import type { SpineItem } from './package'
import type { SpineHooks } from './spine'

export type SectionData = Simplify<
  SpineItem & {
    type: string
    href: string
    url: string
    prev: (() => Section | null) | null
    next: (() => Section | null) | null
    document: XMLDocument
  }
>

export class Section implements SectionData {
  idref: string

  linear: string

  index: number

  type: string

  href: string

  url: string

  prev: (() => Section | null) | null

  next: (() => Section | null) | null

  hooks: SpineHooks

  document: XMLDocument

  root: HTMLElement

  content = ''

  blobUrl = ''

  constructor(data: SectionData, hooks: SpineHooks) {
    this.idref = data.idref
    this.linear = data.linear
    this.index = data.index
    this.type = data.type
    this.href = data.href
    this.url = data.url
    this.document = data.document
    this.root = data.document.documentElement
    this.prev = data.prev
    this.next = data.next
    this.hooks = hooks
  }

  async serialize() {
    const serializer = new XMLSerializer()
    const content = serializer.serializeToString(this.root)
    await this.hooks.serialize.trigger(content, this)

    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl)
    }

    this.blobUrl = URL.createObjectURL(new Blob([this.content], { type: this.type }))
  }

  destroy() {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl)
    }
  }
}
