import { Defer } from '@packages/common/defer'
import { Content } from './content'
import type { Layout } from './layout'
import type { Section } from './section'
import { calculateBorder } from './utils'

export type ViewOptions = {
  width: number
  height: number
  columnWidth: number
  layout: 'reflowable' | 'pre-paginated'
  flow: 'paginated' | 'scrolled-continuous' | 'scrolled-doc'
  axis: 'vertical' | 'horizontal'
}

export class View {
  options: ViewOptions = {
    width: 0,
    height: 0,
    columnWidth: 0,
    layout: 'reflowable',
    flow: 'paginated',
    axis: 'horizontal'
  }

  section: Section

  wrapper: HTMLDivElement

  iframe: HTMLIFrameElement

  displayed: Promise<void>

  window: Promise<Window>

  document: Promise<Document>

  content: Promise<Content>

  private lockedWidth: number | null = null

  private lockedHeight: number | null = null

  private defer = {
    displayed: new Defer<void>(),
    window: new Defer<Window>(),
    document: new Defer<Document>(),
    content: new Defer<Content>()
  }

  constructor(section: Section, layout: Layout) {
    this.section = section

    this.wrapper = this.createWrapper()
    this.iframe = this.createIframe()

    this.displayed = this.defer.displayed.promise
    this.window = this.defer.window.promise
    this.document = this.defer.document.promise
    this.content = this.defer.content.promise
  }

  createWrapper() {
    if (this.wrapper) {
      return this.wrapper
    }

    const wrapper = document.createElement('div')

    wrapper.style.height = '0px'
    wrapper.style.width = '0px'
    wrapper.style.overflow = 'hidden'
    wrapper.style.position = 'relative'
    wrapper.style.display = 'block'

    if (this.options.axis && this.options.axis === 'horizontal') {
      wrapper.style.flex = 'none'
    } else {
      wrapper.style.flex = 'initial'
    }

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

    iframe.style.width = '0px'
    iframe.style.height = '0px'
    iframe.style.overflow = 'hidden'
    iframe.style.border = 'none'
    iframe.style.visibility = 'hidden'

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

      this.defer.window.resolve(window)
      this.defer.document.resolve(document)
      this.defer.content.resolve(content)
    }
  }

  resize(width: number, height: number) {
    this.options.width = width
    this.options.height = height

    this.lock()
  }

  layout(layout: 'reflowable' | 'pre-paginated', axis: 'vertical' | 'horizontal') {
    this.options.layout = layout
    this.options.axis = axis

    this.lock()
  }

  lock() {
    const wrapperBorder = calculateBorder(this.wrapper)
    const iframeBorder = calculateBorder(this.iframe)

    const width = this.options.width
    const height = this.options.height

    if (this.options.layout === 'pre-paginated') {
      this.lockedWidth = width - wrapperBorder.width - iframeBorder.width
      this.lockedHeight = height - wrapperBorder.height - iframeBorder.height
    } else if (this.options.axis === 'horizontal') {
      this.lockedWidth = null
      this.lockedHeight = height - wrapperBorder.height - iframeBorder.height
    } else {
      this.lockedWidth = width - wrapperBorder.width - iframeBorder.width
      this.lockedHeight = null
    }
  }

  expand() {
    //
  }

  destroy() {
    // TODO
  }
}
