import { Defer } from '@common/defer'
import { Hook } from '@common/hook'
import { CFI, type CFIPath, Highlight, type Mark, Pane, type Section } from '..'
import { Content } from './content'

export class View {
  section: Section

  wrapper: HTMLDivElement

  iframe: HTMLIFrameElement

  width = 0

  height = 0

  mousePoint: [number, number] = [0, 0]

  hidden = false

  writingMode = ''

  content: Content | null = null

  pane: Pane

  marks: Map<Range, Mark> = new Map()

  loaded: Promise<this>

  observer: ResizeObserver

  readonly hooks: Readonly<{
    anchorClick: Hook<(href: string) => void>
    imageClick: Hook<(src: string) => void>
    imageLoad: Hook<() => void>
    select: Hook<(selection: Selection) => void>
    resize: Hook<(width: number, height: number) => void>
  }> = {
    anchorClick: new Hook(),
    imageClick: new Hook(),
    imageLoad: new Hook(),
    select: new Hook(),
    resize: new Hook()
  }

  private defer = {
    loaded: new Defer<this>()
  }

  constructor(section: Section) {
    this.section = section

    this.wrapper = this.createWrapper()
    this.iframe = this.createIframe()

    this.pane = new Pane(this.wrapper, this.wrapper)

    this.observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect
        this.width = width
        this.height = height
        console.log('view resize', width, height)
        this.hooks.resize.trigger(width, height)
        this.pane.render()
      }
    })

    this.loaded = this.defer.loaded.promise
  }

  private createWrapper() {
    const wrapper = document.createElement('div')

    wrapper.style.width = '0px'
    wrapper.style.height = '0px'
    wrapper.style.position = 'relative'
    wrapper.style.overflow = 'hidden'

    return wrapper
  }

  private createIframe() {
    const iframe = document.createElement('iframe')

    iframe.style.overflow = 'hidden'
    iframe.style.border = 'none'

    iframe.setAttribute('sandbox', 'allow-same-origin')

    return iframe
  }

  async render() {
    if (!this.section.blobUrl) {
      await this.section.serialize()
    }

    console.log('---------- start render')

    this.iframe.src = this.section.blobUrl
    this.wrapper.appendChild(this.iframe)

    this.iframe.onload = () => {
      const document = this.iframe.contentDocument as Document
      const content = new Content(document)

      this.content = content

      this.observer.observe(document.documentElement)

      const anchors = document.querySelectorAll('a[href]') as NodeListOf<HTMLAnchorElement>
      for (const anchor of anchors) {
        anchor.onclick = (event: MouseEvent) => {
          if (anchor.href) {
            console.log('anchor onclick')
            this.hooks.anchorClick.trigger(anchor.href)
          }

          event.preventDefault()
        }
      }

      const images = document.querySelectorAll('img') as NodeListOf<HTMLImageElement>
      for (const image of images) {
        image.onclick = (event: MouseEvent) => {
          if (image.src) {
            console.log('image onclick')
            this.hooks.imageClick.trigger(image.src)
          }

          event.preventDefault()
        }

        if (image.complete) {
          console.log('image complete')
          this.hooks.imageLoad.trigger()
        } else {
          image.onload = () => {
            console.log('image onload')
            this.hooks.imageLoad.trigger()
          }
        }
      }

      document.onselectionchange = () => {
        const selection = document.getSelection()

        if (selection) {
          console.log('onselectionchange')
          this.hooks.select.trigger(selection)
        }
      }

      document.onmousemove = event => {
        this.mousePoint = [event.x, event.y]
      }

      this.defer.loaded.resolve(this)
    }

    return this.loaded
  }

  rangeToCFI(range: Range) {
    if (this.content && range.commonAncestorContainer.getRootNode() === this.content.document) {
      return CFI.generate(this.section.cfiBase, range)
    }
  }

  cfiPathToRange(path: CFIPath, endPath?: CFIPath) {
    if (this.content) {
      return CFI.pathToRange(path, this.content.document, endPath)
    }
  }

  cfiToRange(cfi: string) {
    if (this.content) {
      const { path, endPath } = CFI.parse(cfi)

      return CFI.pathToRange(path, this.content.document, endPath)
    }
  }

  querySelector(selectors: string) {
    if (this.content) {
      return this.content.document.querySelector(selectors)
    }
  }

  pointToViewportPoint(x: number, y: number) {
    const rect = this.wrapper.getBoundingClientRect()

    return [x + rect.x, y + rect.y] as [number, number]
  }

  getMousePoint() {
    return this.pointToViewportPoint(...this.mousePoint)
  }

  rangeToViewportRect(range: Range) {
    if (this.content && range.commonAncestorContainer.getRootNode() === this.content.document) {
      const rect = range.getBoundingClientRect()
      const containerRect = this.wrapper.getBoundingClientRect()

      return new DOMRect(
        rect.x + containerRect.x,
        rect.y + containerRect.y,
        rect.width,
        rect.height
      )
    }
  }

  rangeToRange(range: Range) {
    if (this.content) {
      if (range.commonAncestorContainer.getRootNode() === this.content.document) {
        return range
      } else if (range.commonAncestorContainer.getRootNode() === this.section.document) {
        const contentRange = this.content.document.createRange()

        const map = (node: Node) => {
          const indexes: number[] = []
          let currentNode = node

          while (
            currentNode &&
            currentNode.parentNode &&
            currentNode.parentNode.nodeType !== Node.DOCUMENT_NODE
          ) {
            const index = Array.prototype.indexOf.call(
              currentNode.parentNode.childNodes,
              currentNode
            )
            indexes.push(index)
            currentNode = currentNode.parentNode
          }

          currentNode = (this.content as Content).root
          for (let i = indexes.length - 1; i >= 0; i--) {
            currentNode = currentNode.childNodes.item(indexes[i])
          }

          return currentNode
        }

        contentRange.setStart(map(range.startContainer), range.startOffset)
        contentRange.setEnd(map(range.endContainer), range.endOffset)

        return contentRange
      }
    }
  }

  mark<T extends keyof SVGElementEventMap>(
    range: Range,
    className: string,
    listeners?: [T, (event: SVGElementEventMap[T], view: View, range: Range) => void][]
  ) {
    if (this.content) {
      let contentRange: Range | null = range

      if (range.commonAncestorContainer.getRootNode() !== this.content.document) {
        contentRange = this.rangeToRange(range) || null
      }

      if (contentRange) {
        const mark = new Highlight(contentRange, className)
        this.pane.addMark(mark)
        if (listeners) {
          for (const [type, listener] of listeners) {
            void (mark.element as SVGElement).addEventListener(
              type,
              (event: SVGElementEventMap[T]) => {
                listener(event, this, range)
              }
            )
          }
        }
        this.marks.set(range, mark)
      }
    }
  }

  unMark(range: Range) {
    const mark = this.marks.get(range)

    if (mark) {
      this.pane.removeMark(mark)
      this.marks.delete(range)
    }
  }

  hide() {
    this.hidden = true

    this.wrapper.style.width = '0px'
    this.wrapper.style.height = '0px'
  }

  show() {
    this.hidden = false

    this.wrapper.style.width = `${this.width}px`
    this.wrapper.style.height = `${this.height}px`
  }

  setSize(width?: number, height?: number) {
    if (this.hidden) {
      return
    }

    if (width) {
      this.width = width
      this.wrapper.style.width = `${width}px`
      this.iframe.style.width = `${width}px`
    } else {
      this.wrapper.style.width = ''
      this.iframe.style.width = ''
    }

    if (height) {
      this.height = height
      this.wrapper.style.height = `${height}px`
      this.iframe.style.height = `${height}px`
    } else {
      this.wrapper.style.height = ''
      this.iframe.style.height = ''
    }
  }

  setAxis(axis: 'vertical' | 'horizontal') {
    if (axis === 'horizontal') {
      this.wrapper.style.flex = 'none'
    } else {
      this.wrapper.style.flex = 'initial'
    }
  }

  destroy() {
    this.pane.element.remove()
    this.marks.clear()
    this.observer.disconnect()
    this.content?.destroy()
  }
}
