export class Content {
  document: Document

  root: HTMLElement

  body: HTMLElement

  constructor(document: Document) {
    this.document = document
    this.root = document.documentElement
    this.body = document.body
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
        (node.textContent as string).trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
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
            range = this.document.createRange()
            range.setStart(node, middle)
            range.setEnd(node, right)

            const rect = range.getBoundingClientRect()
            if (rect.left < start) {
              left = middle + 1
            } else {
              right = middle - 1
            }
          }
        }

        return range
      } else if (rect.left > end) {
        break
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
    // TODO
  }
}
