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
    const rect = this.getRangeBoundingRect(this.body)

    return Math.round(rect.width)
  }

  get textHeight() {
    const rect = this.getRangeBoundingRect(this.body)

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

  getRangeBoundingRect(node: Node) {
    const range = this.document.createRange()
    range.selectNodeContents(node)

    return range.getBoundingClientRect()
  }

  elementFromPoint(x: number, y: number) {
    return this.document.elementFromPoint(x, y) || this.body
  }

  getTextHorizontalStartPosition(element: Element, start: number, end: number) {
    const treeWalker = this.document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: node =>
        node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    })

    let node: Node | null
    while ((node = treeWalker.nextNode())) {
      let range = this.document.createRange()
      range.selectNodeContents(node)

      const rect = range.getBoundingClientRect()
      if (rect.left < end && rect.right > start) {
        if (rect.left < start) {
          let left = 0
          let right = range.endOffset
          while (left < right) {
            const middle = Math.floor((left + right) / 2)
            range = this.document.createRange()
            range.selectNodeContents(node)
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

        range.collapse(true)

        return range
      }
    }

    return null
  }

  setStyle(property: string, value?: string, priority = true) {
    if (value) {
      this.body.style.setProperty(property, value, priority ? 'important' : '')
    } else {
      this.body.style.removeProperty(property)
    }
  }
}
