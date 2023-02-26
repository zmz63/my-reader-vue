import { calculateBorder } from '../utils'

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

  setStyle(property: string, value: string, priority = true) {
    if (value) {
      this.body.style.setProperty(property, value, priority ? 'important' : '')
    } else {
      this.body.style.removeProperty(property)
    }
  }

  setColumns(
    width: number,
    height: number,
    columnWidth: number,
    gap: number,
    direction: 'ltr' | 'rtl'
  ) {
    this.setSize(width, height)
    this.setDirection(direction)

    this.setStyle('overflow', 'hidden')
    this.setStyle('margin', '0px', true)
    this.setStyle('padding-top', '20px')
    this.setStyle('padding-bottom', '20px')
    this.setStyle('padding-left', `${gap / 2}px`, true)
    this.setStyle('padding-right', `${gap / 2}px`, true)
    this.setStyle('box-sizing', 'border-box')
    this.setStyle('max-width', 'inherit')
    this.setStyle('column-fill', 'auto')
    this.setStyle('column-gap', `${gap}px`)
    this.setStyle('column-width', `${columnWidth}px`)
  }

  setSize(width: number, height: number) {
    this.body.style.width = `${width}px`
    this.body.style.height = `${height}px`
  }

  setDirection(direction: 'ltr' | 'rtl') {
    this.root.style.direction = direction
  }
}
