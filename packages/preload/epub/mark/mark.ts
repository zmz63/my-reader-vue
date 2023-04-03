export class Mark {
  range: Range

  element: SVGElement | null = null

  container: HTMLElement | null = null

  constructor(range: Range) {
    this.range = range
  }

  bind(element: SVGElement, container: HTMLElement) {
    this.element = element
    this.container = container
  }

  unbind() {
    const element = this.element
    this.element = null

    return element
  }

  render() {
    //
  }

  dispatchEvent(event: Event) {
    if (!this.element) {
      return
    }

    this.element.dispatchEvent(event)
  }

  getBoundingClientRect() {
    if (!this.element) {
      return
    }

    return this.element.getBoundingClientRect()
  }

  getClientRects() {
    if (!this.element) {
      return
    }

    const rects: DOMRect[] = []
    let element = this.element.firstChild
    while (element) {
      rects.push((element as Element).getBoundingClientRect())
      element = element.nextSibling
    }

    return rects
  }

  getRangeRects() {
    const startNode = this.range.startContainer
    const endNode = this.range.endContainer
    const rects: DOMRect[] = []

    if (startNode === endNode) {
      rects.push(...this.range.getClientRects())

      return rects
    }

    const treeWalker = document.createTreeWalker(
      this.range.commonAncestorContainer,
      NodeFilter.SHOW_TEXT + NodeFilter.SHOW_ELEMENT
    )

    let range = (startNode.ownerDocument as Document).createRange()
    range.selectNodeContents(startNode)
    range.setStart(startNode, this.range.startOffset)
    rects.push(...range.getClientRects())

    let node: Node | null = null
    while ((node = treeWalker.nextNode())) {
      if (node === startNode) {
        break
      }
    }
    while ((node = treeWalker.nextNode())) {
      if (node === endNode) {
        break
      }

      if (node.nodeType === Node.TEXT_NODE && (node.textContent as string).trim()) {
        range = (startNode.ownerDocument as Document).createRange()
        range.selectNodeContents(node)
        rects.push(...range.getClientRects())
      } else if ((node as Element).tagName && (node as Element).tagName.toUpperCase() === 'IMG') {
        range = (startNode.ownerDocument as Document).createRange()
        range.selectNode(node)
        rects.push(...range.getClientRects())
      }
    }

    range = (startNode.ownerDocument as Document).createRange()
    range.selectNodeContents(endNode)
    range.setEnd(endNode, this.range.endOffset)
    rects.push(...range.getClientRects())

    return rects
  }
}
