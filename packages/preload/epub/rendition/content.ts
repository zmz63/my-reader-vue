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
    const range = this.document.createRange()

    range.selectNodeContents(this.body)

    const rect = range.getBoundingClientRect()

    return Math.round(rect.width)
  }

  get textHeight() {
    const range = this.document.createRange()

    range.selectNodeContents(this.body)

    const rect = range.getBoundingClientRect()

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

  setStyle(property: string, value?: string, priority = true) {
    if (value) {
      this.body.style.setProperty(property, value, priority ? 'important' : '')
    } else {
      this.body.style.removeProperty(property)
    }
  }
}
