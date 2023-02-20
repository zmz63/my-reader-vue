import { calculateBorder } from './utils'

export class Content {
  document: Document

  root: HTMLElement

  body: HTMLElement

  constructor(document: Document) {
    this.document = document
    this.root = document.documentElement
    this.body = document.body
  }

  textWidth() {
    const range = this.document.createRange()
    const border = calculateBorder(this.body)

    range.selectNodeContents(this.body)

    const rect = range.getBoundingClientRect()

    let width = rect.width

    if (border.width) {
      width += border.width
    }

    return Math.round(width)
  }

  textHeight() {
    const range = this.document.createRange()
    const border = calculateBorder(this.body)

    range.selectNodeContents(this.body)

    const rect = range.getBoundingClientRect()

    let height = rect.height

    if (border.height) {
      height += border.height
    }

    return Math.round(height)
  }

  scrollWidth() {
    const width = this.root.scrollWidth

    return width
  }

  scrollHeight() {
    const height = this.root.scrollHeight

    return height
  }

  overrideStyles(element: HTMLElement, styles: Record<string, string>, important = true) {
    const values: string[] = []

    for (const key in styles) {
      values.push(`${key}: ${styles[key]}`)
    }

    values.push('')

    element.setAttribute('style', values.join(important ? ' !important;' : ';'))
  }
}
