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

    this.updateViewData()
  }

  async display(target?: number | string) {
    await this.book.opened

    const section = target === undefined ? this.book.spine.first() : this.book.spine.get(target)

    if (!section) {
      // TODO
      throw new Error()
    }

    const view = this.views.find(section)

    if (view) {
      //
    } else {
      await this.append(section)
    }
  }

  async prev() {
    if (this.stage.x > -this.viewData.pageWidth * 0.5) {
      const prev = this.views.first().section.prev()
      if (prev) {
        this.views.clear()

        const view = await this.prepend(prev)

        this.stage.setTranslate(-view.width + this.viewData.width, 0)
      }
    } else {
      this.stage.setTranslateOffset(this.viewData.width, 0)
    }
  }

  async next() {
    if (
      this.stage.containerWidth + this.stage.x <
      this.viewData.pageWidth * (this.viewData.divisor + 0.5)
    ) {
      const next = this.views.last().section.next()
      if (next) {
        this.views.clear()

        await this.append(next)

        this.stage.setTranslate(0, 0)
      }
    } else {
      this.stage.setTranslateOffset(-this.viewData.width, 0)
    }
  }

  async append(section: Section) {
    const view = new View(section)

    this.views.append(view)

    await view.render()

    this.initViewLayout(view)

    this.stage.setSize(view.width, this.stage.height)

    return view
  }

  async prepend(section: Section) {
    const view = new View(section)

    this.views.prepend(view)

    await view.render()

    this.initViewLayout(view)

    this.stage.setSize(view.width, this.stage.height)

    return view
  }

  initViewLayout(view: View) {
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

    this.updateViewLayout(view)
  }

  updateViewData() {
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
  }

  updateStageLayout() {
    this.updateViewData()

    let width = 0

    this.views.forEach(view => {
      this.updateViewLayout(view)
      width += view.width
    })

    this.stage.setSize(width, this.stage.height)
  }

  updateViewLayout(view: View, fill = true) {
    if (view.hidden || !view.content) {
      return {
        pages: 0,
        width: 0
      }
    }

    const content = view.content

    const { height, gap, columnWidth, pageWidth } = this.viewData

    content.setStyle('width', `${pageWidth}px`, true)
    content.setStyle('height', `${height}px`, true)
    content.setStyle('padding-left', `${gap / 2}px`, true)
    content.setStyle('padding-right', `${gap / 2}px`, true)
    content.setStyle('column-gap', `${gap}px`, true)
    content.setStyle('column-width', `${columnWidth}px`, true)

    // NOTE
    // view.setSize(content.textWidth(), height)

    let width = content.textWidth() + gap
    let pages = Math.round(width / pageWidth)

    if (fill && this.viewData.divisor > 1 && pages % 2 !== 0) {
      pages += 1
      width += pageWidth
    }

    view.setSize(width, height)

    return {
      pages,
      width
    }
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
