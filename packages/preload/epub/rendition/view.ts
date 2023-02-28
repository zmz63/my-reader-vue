import { Defer } from '@packages/common/defer'
import type { Section } from '../book/section'
import { Content } from './content'

export class View {
  section: Section

  wrapper: HTMLDivElement

  iframe: HTMLIFrameElement

  width = 0

  height = 0

  hidden = true

  writingMode: string | null = null

  window: Window | null = null

  document: Document | null = null

  content: Content | null = null

  loaded: Promise<void>

  private defer = {
    loaded: new Defer<void>()
  }

  constructor(section: Section) {
    this.section = section

    this.wrapper = this.createWrapper()
    this.iframe = this.createIframe()

    this.loaded = this.defer.loaded.promise
  }

  private createWrapper() {
    const wrapper = document.createElement('div')

    wrapper.classList.add('epub-view-wrapper')

    wrapper.style.width = '0px'
    wrapper.style.height = '0px'
    wrapper.style.position = 'relative'
    wrapper.style.display = 'block'

    return wrapper
  }

  private createIframe() {
    const iframe = document.createElement('iframe')

    iframe.classList.add('epub-view')

    iframe.style.width = '0px'
    iframe.style.height = '0px'
    iframe.style.overflow = 'hidden'
    iframe.style.border = 'none'

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

      this.window = window
      this.document = document
      this.content = content

      this.defer.loaded.resolve()
    }

    return this.loaded
  }

  hide() {
    this.hidden = true

    this.width = 0
    this.height = 0

    this.wrapper.style.width = '0px'
    this.wrapper.style.height = '0px'

    this.iframe.style.width = '0px'
    this.iframe.style.height = '0px'
  }

  show() {
    this.hidden = false
  }

  setSize(width: number, height: number) {
    if (this.hidden) {
      return
    }

    this.width = width
    this.height = height

    this.wrapper.style.width = `${width}px`
    this.wrapper.style.height = `${height}px`

    this.iframe.style.width = `${width}px`
    this.iframe.style.height = `${height}px`
  }

  setAxis(axis: 'vertical' | 'horizontal') {
    if (axis === 'horizontal') {
      this.wrapper.style.flex = 'none'
    } else {
      this.wrapper.style.flex = 'initial'
    }
  }

  destroy() {
    // TODO
  }
}
