import type { SpineItem } from './package'
import type { SpineHooks } from './spine'

export type SectionData = Simplify<
  SpineItem & {
    type: string
    href: string
    url: string
    prev: (() => Section | null) | null
    next: (() => Section | null) | null
    cfiBase: string
  }
>

export class Section {
  data: SectionData

  hooks: SpineHooks

  document: XMLDocument

  root: HTMLElement

  content = ''

  blobUrl = ''

  constructor(data: SectionData, document: XMLDocument, hooks: SpineHooks) {
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
