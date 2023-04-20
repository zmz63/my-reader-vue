import { Mark } from './mark'

export class Highlight extends Mark {
  className: string

  data: Record<string, string>

  attributes: Record<string, string>

  constructor(
    range: Range,
    className: string,
    data?: Record<string, string>,
    attributes?: Record<string, string>
  ) {
    super(range)

    this.className = className
    this.data = data || {}
    this.attributes = attributes || {}
  }

  bind(element: SVGElement, container: HTMLElement) {
    super.bind(element, container)

    for (const key in this.data) {
      element.dataset[key] = this.data[key]
    }

    for (const key in this.attributes) {
      element.setAttribute(key, this.attributes[key])
    }

    if (this.className) {
      element.classList.add(this.className)
    }
  }

  render() {
    if (!this.element || !this.container) {
      return
    }

    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild)
    }

    const fragment = this.element.ownerDocument.createDocumentFragment()
    const rects = this.getRangeRects()
    const elementRect = this.element.getBoundingClientRect()
    const containerRect = this.container.getBoundingClientRect()

    for (const rect of rects) {
      const element = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      element.setAttribute('x', (rect.x - elementRect.x + containerRect.x).toString())
      element.setAttribute('y', (rect.y - elementRect.y + containerRect.y).toString())
      element.setAttribute('height', rect.height.toString())
      element.setAttribute('width', rect.width.toString())
      fragment.appendChild(element)
    }

    this.element.appendChild(fragment)
  }
}
