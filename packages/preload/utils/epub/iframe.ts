import type { Section } from '.'
import { overrideStyles } from '../common'
import type EPubView from './view'
import type { ViewOptions } from './view'

class IframeView {
  index: number

  iframe: HTMLIFrameElement

  window: Window | null = null

  document: Document | null = null

  constructor(
    public view: EPubView,
    public section: Section,
    public options: ViewOptions,
    public onLoad?: (document: Document) => void
  ) {
    this.index = section.index
    this.iframe = this.create()
  }

  create() {
    const iframe = document.createElement('iframe')

    iframe.style.width = '0'
    iframe.style.height = '0'

    this.setSandbox(iframe)

    iframe.src = this.section.blobUrl

    iframe.onload = () => {
      console.log('onload')
      this.window = iframe.contentWindow
      this.document = iframe.contentDocument

      if (this.document) {
        this.overrideStyles()
        this.externalResize()

        // const images = this.document.querySelectorAll('img[src]')
        // for (const image of images) {
        // }

        const anchors = this.document.querySelectorAll('a[href]')
        for (const anchor of anchors) {
          const href = anchor.getAttribute('href')
          anchor.addEventListener('click', event => {
            console.log(href)
            event.preventDefault()
          })
        }

        if (this.onLoad) {
          this.onLoad(this.document)
        }
      }
    }

    return iframe
  }

  hidden() {
    this.iframe.style.display = 'none'
  }

  show() {
    this.iframe.style.display = 'block'
  }

  setSandbox(iframe: HTMLIFrameElement) {
    const { allowScripts, allowPopups } = this.options

    let sandbox = 'allow-same-origin'
    if (allowScripts) {
      sandbox += ' allow-scripts'
    }
    if (allowPopups) {
      sandbox += ' allow-popups'
    }
    iframe.setAttribute('sandbox', sandbox)
  }

  setStyle(property: string, value?: string, important = true) {
    if (!this.document) return

    if (value) {
      this.document.body.style.setProperty(property, value, important ? 'important' : undefined)
    } else {
      this.document.body.style.removeProperty(property)
    }
  }

  overrideStyles() {
    if (!this.document) return

    overrideStyles(this.document.documentElement, {
      overflow: 'hidden',
      padding: '0',
      border: 'none',
      margin: '0'
    })

    const { backgroundColor, fontSize } = this.options

    overrideStyles(this.document.body, {
      'box-sizing': 'border-box',
      'padding': '0',
      'border': 'none',
      'margin': '0',
      'background-color': backgroundColor,
      'font-size': `${fontSize}px`
    })
  }

  setBackground() {
    if (!this.document) return

    this.setStyle('background-color', this.options.backgroundColor)
  }

  setFontSize() {
    if (!this.document) return

    this.setStyle('font-size', `${this.options.fontSize}px`)

    this.internalResize()
  }

  setPadding() {
    if (!this.document) return

    this.setStyle('padding', `0 ${this.options.padding * this.view.width}px`)

    this.internalResize()
  }

  internalResize() {
    if (!this.document) return

    const { layout, axis } = this.options

    if (layout === 'scroll') {
      this.reframe(undefined, this.document.documentElement.scrollHeight)
    }
  }

  externalResize() {
    if (!this.document) return

    const { layout, axis, padding } = this.options
    const width = this.view.width
    let height = this.view.height

    this.setStyle('padding', `0 ${padding * width}px`)

    if (layout === 'scroll') {
      this.setStyle('width', `${width}px`)

      console.log(this.document.documentElement.clientHeight)
      console.log(this.document.documentElement.scrollHeight)
      console.log(this.window?.getComputedStyle(this.document.documentElement).height)
      console.log(this.document.documentElement.getBoundingClientRect().height)

      height = this.document.documentElement.scrollHeight
    }

    this.reframe(width, height)
  }

  reframe(width?: number, height?: number) {
    if (width) {
      this.iframe.style.width = `${width}px`
    }

    if (height) {
      this.iframe.style.height = `${height}px`
    }
  }
}

export default IframeView
