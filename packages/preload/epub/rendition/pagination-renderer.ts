import { Queue } from '@common/queue'
import { type Book, CFI, type Section } from '..'
import { Stage } from './stage'
import { View } from './view'
import { Views } from './views'

export type PaginationOptions = {
  layout: 'relowable' | 'pre-paginated'
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
  horizontalPadding: number
  verticalPadding: number
}

export type Location = {
  index: number
  totalPages: number
  currentPage: number
  range: Range | null
  cfi: string
}

export class PaginationRenderer {
  stage = new Stage()

  book: Book

  views: Views

  queue: Queue

  options: PaginationOptions = {
    layout: 'relowable',
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
    horizontalPadding: 0,
    verticalPadding: 0
  }

  location: Location = {
    index: 0,
    totalPages: 0,
    currentPage: 0,
    range: null,
    cfi: ''
  }

  constructor(book: Book, options?: Partial<PaginationOptions>) {
    this.book = book
    this.views = new Views(this.stage.container)
    this.queue = new Queue(this)

    Object.assign(this.options, options)
  }

  async attachTo(element: Element) {
    await this.book.unpacked

    this.stage.hooks.resize.register(() => this.updateStageLayout())
    this.stage.attachTo(element)

    this.updateViewData()
  }

  determineOptions() {
    // TODO
  }

  async display(target?: number | string) {
    await this.book.unpacked

    const section = target === undefined ? this.book.spine.first() : this.book.spine.get(target)

    if (!section) {
      // TODO
      throw new Error()
    }

    const view = this.views.find(section)

    if (view) {
      //
    } else {
      const view = await this.add(section)

      this.updateLocation(view)
    }
  }

  async prev() {
    let view = this.views.last()

    if (this.stage.x > -this.viewData.pageWidth * 0.5) {
      const prev = view.section.prev()
      if (prev) {
        this.views.clear()

        view = await this.add(prev, 'prepend')
      } else {
        return
      }
    } else {
      this.stage.scrollOffset(-this.viewData.width, 0)

      this.location.currentPage -= this.viewData.divisor
    }

    this.updateLocation(view)
  }

  async next() {
    if (!this.location) {
      return
    }

    let view = this.views.last()

    if (
      this.stage.containerWidth + this.stage.x <
      this.viewData.pageWidth * (this.viewData.divisor + 0.5)
    ) {
      const next = view.section.next()
      if (next) {
        this.views.clear()

        view = await this.add(next)
      } else {
        return
      }
    } else {
      this.stage.scrollOffset(this.viewData.width, 0)

      this.location.currentPage += this.viewData.divisor
    }

    this.updateLocation(view)
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
      this.stage.scrollTo(0, 0)
    } else {
      this.location.currentPage = Math.round(view.width / this.viewData.pageWidth)
      if (this.viewData.divisor > 1 && this.location.currentPage % 2 === 0) {
        this.location.currentPage -= 1
      }
      this.stage.scrollTo((this.location.currentPage - 1) * this.viewData.pageWidth, 0)
    }

    return view
  }

  updateLocation(view: View) {
    if (view.hidden || !view.content) {
      return
    }

    const content = view.content
    const start = this.viewData.pageWidth * (this.location.currentPage - 1)
    const end = this.viewData.pageWidth * this.location.currentPage
    const element = content.elementFromPoint(
      start + this.viewData.horizontalPadding,
      this.viewData.verticalPadding
    )
    const range = content.getTextHorizontalStartRange(element, start, end)

    this.location.range = range
    this.location.cfi = range ? CFI.rangeToCFI(range, view.section.cfiBase) : ''

    // console.log(element, this.location)
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
      horizontalPadding: 0,
      verticalPadding: Math.floor(this.stage.height / 24)
    }

    data.divisor = this.options.spread && data.width >= this.options.minSpreadWidth ? 2 : 1
    data.gap = this.options.gap || Math.floor(data.width / 12)
    if (data.gap % 2 !== 0) {
      data.gap -= 1
    }
    data.pageWidth = data.width / data.divisor
    data.columnWidth = data.pageWidth - data.gap
    data.horizontalPadding = Math.floor(data.gap / 2)

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

    if (this.location.range) {
      const rect = this.location.range.getBoundingClientRect()
      const index = Math.floor(rect.left / this.viewData.pageWidth)
      this.location.currentPage = index + 1
      if (this.viewData.divisor > 1 && this.location.currentPage % 2 === 0) {
        this.location.currentPage -= 1
      }
      this.stage.scrollTo((this.location.currentPage - 1) * this.viewData.pageWidth, 0)
      // console.log(rect, this.stage.x, this.viewData.pageWidth, this.location.currentPage)
    }
  }

  updateViewLayout(view: View, fill = true) {
    if (view.hidden || !view.content) {
      return
    }

    const content = view.content

    const { height, gap, columnWidth, pageWidth, horizontalPadding, verticalPadding } =
      this.viewData

    content.setStyle('width', `${pageWidth}px`, true)
    content.setStyle('height', `${height}px`, true)
    content.setStyle('padding-left', `${horizontalPadding}px`, true)
    content.setStyle('padding-right', `${horizontalPadding}px`, true)
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
