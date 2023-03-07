import { Queue } from '@packages/common/queue'
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
  verticalPadding: number
}

export type Location = {
  index: number
  totalPages: number
  currentPage: number
  cfiMap: {
    start: string
    end: string
  }
}

export class PaginationController {
  stage = new Stage()

  book: Book

  views: Views

  queue: Queue

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
    columnWidth: 0,
    verticalPadding: 0
  }

  location: Location = {
    index: 0,
    totalPages: 0,
    currentPage: 0,
    cfiMap: {
      start: '',
      end: ''
    }
  }

  constructor(book: Book, element: Element, options?: Partial<PaginationOptions>) {
    this.book = book
    this.views = new Views(this.stage.container)
    this.queue = new Queue(this)

    Object.assign(this.options, options)

    // this.queue.enqueue(this.init, element)
    this.init(element)
  }

  async init(element: Element) {
    await this.book.opened

    this.stage.hooks.resize.register(() => this.updateStageLayout())
    this.stage.attachTo(element)

    this.updateViewData()
  }

  determineOptions() {
    // TODO
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
      await this.add(section)
    }
  }

  async prev() {
    if (!this.location) {
      return
    }

    const view = this.views.last()

    if (this.stage.x > -this.viewData.pageWidth * 0.5) {
      const prev = view.section.prev()
      if (prev) {
        this.views.clear()

        await this.add(prev, 'prepend')
      }
    } else {
      this.stage.setTranslateOffset(this.viewData.width, 0)

      this.location.currentPage -= 1
    }
  }

  async next() {
    if (!this.location) {
      return
    }

    const view = this.views.last()

    if (
      this.stage.containerWidth + this.stage.x <
      this.viewData.pageWidth * (this.viewData.divisor + 0.5)
    ) {
      const next = view.section.next()
      if (next) {
        this.views.clear()

        await this.add(next)
      }
    } else {
      this.stage.setTranslateOffset(-this.viewData.width, 0)

      this.location.currentPage += 1
    }
  }

  async add(section: Section, mode: 'append' | 'prepend' = 'append') {
    const view = new View(section)

    if (mode === 'append') {
      this.views.append(view)
    } else {
      this.views.prepend(view)
    }

    await view.render()

    this.initViewLayout(view)

    this.stage.setSize(view.width, this.stage.height)

    this.location.index = view.section.index

    if (mode === 'append') {
      this.location.currentPage = 1
      this.stage.setTranslate(0, 0)
    } else {
      this.location.currentPage = view.width / this.viewData.pageWidth + 1 - this.viewData.divisor
      this.stage.setTranslate(-view.width + this.viewData.width, 0)
    }

    return view
  }

  updateLocation(view: View) {
    if (view.hidden || !view.content) {
      return
    }

    const content = view.content

    console.log(
      content.document.elementFromPoint(
        this.viewData.pageWidth * (this.location.currentPage - 1),
        this.viewData.verticalPadding
      )
    )
  }

  initViewLayout(view: View) {
    if (!view.content) {
      return
    }

    const content = view.content

    content.setStyle('overflow', 'hidden', true)
    content.setStyle('margin', '0px', true)
    content.setStyle('border', 'none', true)
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
      columnWidth: this.stage.width,
      verticalPadding: Math.floor(this.stage.height / 24)
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
      return
    }

    const content = view.content

    const { height, gap, columnWidth, pageWidth, verticalPadding } = this.viewData

    content.setStyle('width', `${pageWidth}px`, true)
    content.setStyle('height', `${height}px`, true)
    content.setStyle('padding-left', `${gap / 2}px`, true)
    content.setStyle('padding-right', `${gap / 2}px`, true)
    content.setStyle('padding-top', `${verticalPadding}px`, true)
    content.setStyle('padding-bottom', `${verticalPadding}px`, true)
    content.setStyle('column-gap', `${gap}px`, true)
    content.setStyle('column-width', `${columnWidth}px`, true)

    // NOTE
    // view.setSize(content.textWidth, height)

    let width = content.textWidth + gap
    let totalPages = Math.round(width / pageWidth)

    if (fill && this.viewData.divisor > 1 && totalPages % 2 !== 0) {
      width += pageWidth
      totalPages += 1
    }

    view.setSize(width, height)

    this.location.totalPages = totalPages
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
