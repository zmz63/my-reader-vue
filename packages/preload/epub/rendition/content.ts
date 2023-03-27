import { Hook } from '@common/hook'

export class Content {
  document: Document

  root: HTMLElement

  body: HTMLElement

  observer: ResizeObserver

  readonly hooks: Readonly<{
    link: Hook<(href: string) => void>
    image: Hook<(src: string) => void>
    select: Hook<(selection: Selection) => void>
    resize: Hook<(width: number, height: number) => void>
  }> = {
    link: new Hook(),
    image: new Hook(),
    select: new Hook(),
    resize: new Hook()
  }

  constructor(document: Document) {
    this.document = document
    this.root = document.documentElement
    this.body = document.body

    this.observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect
        this.hooks.resize.trigger(width, height)
      }
    })
    this.observer.observe(this.root)

    const anchors = this.document.querySelectorAll('a[href]') as NodeListOf<HTMLAnchorElement>
    for (const anchor of anchors) {
      anchor.onclick = (event: MouseEvent) => {
        if (anchor.href) {
          this.hooks.link.trigger(anchor.href)
        }

        event.preventDefault()
      }
    }

    const images = this.document.querySelectorAll('img') as NodeListOf<HTMLImageElement>
    for (const image of images) {
      image.onclick = (event: MouseEvent) => {
        if (image.src) {
          this.hooks.image.trigger(image.src)
        }

        event.preventDefault()
      }
    }

    this.document.onselectionchange = () => {
      const selection = this.document.getSelection()

      if (selection) {
        this.hooks.select.trigger(selection)
      }
    }
  }

  get textWidth() {
    const rect = this.getNodeContentsRangeBoundingRect(this.body)

    return Math.round(rect.width)
  }

  get textHeight() {
    const rect = this.getNodeContentsRangeBoundingRect(this.body)

    return Math.round(rect.height)
  }

  get clientWidth() {
    return this.root.clientWidth
  }

  get clientHeight() {
    return this.root.clientHeight
  }

  get scrollWidth() {
    return this.root.scrollWidth
  }

  get scrollHeight() {
    return this.root.scrollHeight
  }

  getNodeContentsRange(node: Node) {
    const range = this.document.createRange()
    range.selectNodeContents(node)

    return range
  }

  getNodeContentsRangeBoundingRect(node: Node) {
    const range = this.getNodeContentsRange(node)

    return range.getBoundingClientRect()
  }

  elementFromPoint(x: number, y: number) {
    return this.document.elementFromPoint(x, y) || this.body
  }

  getTextHorizontalStartRange(element: Element, start: number, end: number) {
    const treeWalker = this.document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: node =>
        node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    })

    let node: Node | null
    while ((node = treeWalker.nextNode())) {
      let range = this.getNodeContentsRange(node)

      const rect = range.getBoundingClientRect()
      if (rect.left < end && rect.right > start) {
        if (rect.left < start) {
          let left = 0
          let right = range.endOffset
          while (left < right) {
            const middle = Math.floor((left + right) / 2)
            range = this.getNodeContentsRange(node)
            range.setStart(node, left)
            range.setEnd(node, middle)

            const rect = range.getBoundingClientRect()
            if (rect.right < start) {
              left = middle + 1
            } else {
              right = middle - 1
            }
          }
        }

        return range
      } else if (rect.left > end) {
        return null
      }
    }

    return null
  }

  getStylesheetNode() {
    let styleElement = this.document.querySelector('style')

    if (!styleElement) {
      styleElement = this.document.createElement('style')
      this.document.head.appendChild(styleElement)
    }

    return styleElement
  }

  setStyle(property: string, value?: string, priority = true) {
    if (value) {
      this.body.style.setProperty(property, value, priority ? 'important' : '')
    } else {
      this.body.style.removeProperty(property)
    }
  }

  addStylesheetRule(selector: string, rule: Record<string, string>) {
    const stylesheet = this.getStylesheetNode().sheet

    if (!stylesheet) {
      return
    }

    stylesheet.insertRule(
      `${selector}{${Object.entries(rule)
        .map(([key, value]) => `${key}:${value};`)
        .join('')}}`,
      stylesheet.cssRules.length
    )
  }

  destroy() {
    this.observer.disconnect()
  }
}
