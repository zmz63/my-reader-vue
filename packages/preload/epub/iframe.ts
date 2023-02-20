import { Defer } from '@packages/common/defer'
import { Content } from './content'
import type { Section } from './section'

export class IframeView {
  section: Section

  wrapper: HTMLDivElement

  iframe: HTMLIFrameElement

  document: Promise<Document>

  window: Promise<Window>

  content: Promise<Content>

  loaded = {
    window: new Defer<Window>(),
    document: new Defer<Document>(),
    content: new Defer<Content>()
  }

  constructor(section: Section) {
    this.section = section
    this.wrapper = this.createWrapper()
    this.iframe = this.createIframe()

    this.window = this.loaded.window.promise
    this.document = this.loaded.document.promise
    this.content = this.loaded.content.promise
  }

  createWrapper() {
    if (this.wrapper) {
      return this.wrapper
    }

    const wrapper = document.createElement('div')

    return wrapper
  }

  createIframe() {
    if (this.iframe) {
      return this.iframe
    }

    if (!this.wrapper) {
      this.wrapper = this.createWrapper()
    }

    this.wrapper.style.visibility = 'hidden'

    const iframe = document.createElement('iframe')

    iframe.style.overflow = 'hidden'
    iframe.style.border = 'none'
    iframe.style.visibility = 'hidden'
    iframe.style.width = '0'
    iframe.style.height = '0'

    iframe.setAttribute('sandbox', 'allow-same-origin')

    return iframe
  }

  async render() {
    if (!this.section.blobUrl) {
      await this.section.serialize()
    }

    this.iframe.src = this.section.blobUrl
    this.wrapper.appendChild(this.iframe)

    this.iframe.onload = () => {
      const window = this.iframe.contentWindow as Window
      const document = this.iframe.contentDocument as Document
      const content = new Content(document)

      this.loaded.window.resolve(window)
      this.loaded.document.resolve(document)
      this.loaded.content.resolve(content)
    }
  }
}
