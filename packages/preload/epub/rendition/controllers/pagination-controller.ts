import type { Book } from '../..'
import type { Section } from '../../book/section'
import { RenditionLayout } from '../constants'
import type { Content } from '../content'
import { Stage } from '../stage'
import { View } from '../view'
import { Views } from '../views'

export type PaginationOptions = {
  layout: RenditionLayout
  spread: boolean
  minSpreadWidth: number
  gap: number
}

export type PaginationViewData = {
  width: number
  height: number
  divisor: number
  gap: number
  pageWidth: number
  columnWidth: number
}

export class PaginationController {
  book: Book

  stage: Stage

  views: Views

  options: PaginationOptions = {
    layout: RenditionLayout.Relowable,
    spread: true,
    minSpreadWidth: 800,
    gap: 0
  }

  viewData: PaginationViewData = {
    width: 0,
    height: 0,
    divisor: 1,
    gap: 0,
    pageWidth: 0,
    columnWidth: 0
  }

  constructor(book: Book, element: Element, options?: Partial<PaginationOptions>) {
    this.book = book
    this.stage = new Stage()
    this.views = new Views(this.stage.container)

    Object.assign(this.options, options)

    this.init(element)

    this.stage.hooks.resize.register(() => this.updateStageLayout())
  }

  async init(element: Element) {
    await this.book.opened

    this.stage.attachTo(element)
  }

  async display(target: number | string) {
    await this.book.opened

    const section = this.book.spine.get(target)

    if (!section) {
      // TODO
      throw new Error()
    }

    let view = this.views.find(section)

    if (view) {
      //
    } else {
      view = new View(section)

      this.views.append(view)

      await view.render()

      this.initContentLayout(view)
      this.updateStageLayout()
    }
  }

  prev() {
    //
  }

  next() {
    //
  }

  initContentLayout(view: View) {
    if (!view.content) {
      return
    }

    const content = view.content

    content.setStyle('overflow', 'hidden', true)
    content.setStyle('margin', '0px', true)
    content.setStyle('border', 'none', true)
    content.setStyle('padding-top', '20px', true)
    content.setStyle('padding-bottom', '20px', true)
    content.setStyle('box-sizing', 'border-box', true)
    content.setStyle('max-width', 'inherit', true)
    content.setStyle('column-fill', 'auto', true)
  }

  updateStageLayout() {
    const data: PaginationViewData = {
      width: this.stage.width,
      height: this.stage.height,
      divisor: 1,
      gap: 0,
      pageWidth: this.stage.width,
      columnWidth: this.stage.width
    }

    data.divisor = this.options.spread && data.width >= this.options.minSpreadWidth ? 2 : 1
    data.gap = this.options.gap || Math.floor(data.width / 12)
    data.pageWidth = data.width / data.divisor
    data.columnWidth = data.pageWidth - data.gap

    this.viewData = data

    let width = 0

    this.views.forEach(view => {
      width += data.pageWidth * this.updateViewLayout(view)
    })

    this.stage.setSize(width, this.stage.height)
  }

  updateViewLayout(view: View) {
    if (view.hidden || !view.content) {
      return 0
    }

    const content = view.content

    const { height, gap, columnWidth, pageWidth } = this.viewData

    content.setStyle('width', `${pageWidth}px`, true)
    content.setStyle('height', `${height}px`, true)
    content.setStyle('padding-left', `${gap / 2}px`, true)
    content.setStyle('padding-right', `${gap / 2}px`, true)
    content.setStyle('column-gap', `${gap}px`, true)
    content.setStyle('column-width', `${columnWidth}px`, true)

    view.setSize(content.textWidth() + gap, height)

    return Math.round(view.width / pageWidth)
  }

  setSpread(spread: boolean, minSpreadWidth = 800, gap = 0) {
    this.options.spread = spread
    this.options.minSpreadWidth = minSpreadWidth
    this.options.gap = gap

    this.updateStageLayout()
  }

  clear() {
    //
  }

  destroy() {
    //
  }
}
