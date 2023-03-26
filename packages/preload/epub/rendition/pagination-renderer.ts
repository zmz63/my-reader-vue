import { Queue } from '@common/queue'
import { type Book, CFI, type CFIPath, Content, type Section } from '..'
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

    let section: Section | undefined
    let cfi = ''
    let path: CFIPath | null = null
    if (CFI.isCFI(target)) {
      const result = CFI.parse(target as string)
      section = this.book.spine.get(result.base.sectionIndex)
      cfi = target as string
      path = result.path
    } else {
      section = this.book.spine.get(target)
    }

    if (!section) {
      // TODO
      throw new Error()
    }

    let view = this.views.find(section)
    if (!view) {
      view = await this.setView(section)
    }

    if (path) {
      const range = CFI.pathToRange(path, (view.content as Content).document)

      this.moveTo(range)
      this.location.cfi = cfi
      this.location.range = range
    } else {
      this.stage.scrollTo(0, 0)
      this.updateLocation(view)
    }
  }

  async prev() {
    let view = this.views.get(0)

    if (this.stage.x > -this.viewData.pageWidth * 0.5) {
      const prev = view.section.prev()
      if (prev) {
        view = await this.setView(prev)

        const n = Math.floor(view.width / this.viewData.pageWidth) - 1
        const offset =
          (this.viewData.divisor > 1 && n % 2 === 1 ? n - 1 : n) * this.viewData.pageWidth
        this.stage.scrollTo(offset, 0)
        this.updateLocation(view)
      }
    } else {
      this.stage.scrollOffset(-this.viewData.width, 0)
      this.updateLocation(view)
    }
  }

  async next() {
    if (!this.location) {
      return
    }

    let view = this.views.get(0)

    if (
      this.stage.containerWidth + this.stage.x <
      this.viewData.pageWidth * (this.viewData.divisor + 0.5)
    ) {
      const next = view.section.next()
      if (next) {
        view = await this.setView(next)

        this.stage.scrollTo(0, 0)
        this.updateLocation(view)
      }
    } else {
      this.stage.scrollOffset(this.viewData.width, 0)
      this.updateLocation(view)
    }
  }

  async setView(section: Section) {
    const view = new View(section)

    this.views.set(0, view)

    await view.render()

    this.initViewContent(view)

    this.stage.setSize(view.width, this.stage.height)

    return view
  }

  updateLocation(view: View) {
    if (view.hidden || !view.content) {
      return
    }

    const content = view.content
    const start = this.stage.offsetX
    const end = this.stage.offsetX + this.viewData.pageWidth
    const element = content.elementFromPoint(
      start + this.viewData.horizontalPadding,
      this.viewData.verticalPadding
    )

    const range =
      content.getTextHorizontalStartRange(element, start, end) ||
      content.getNodeContentsRange(element)

    // range.collapse(true)

    this.location.range = range
    this.location.cfi = range ? CFI.generate(view.section.cfiBase, range) : ''

    console.log(element, range, range.startContainer, this.location.cfi)
  }

  initViewContent(view: View) {
    if (!view.content) {
      return
    }

    const content = view.content

    content.setStyle('position', 'relative', true)
    content.setStyle('overflow', 'hidden', true)
    content.setStyle('margin', '0px', true)
    content.setStyle('border', 'none', true)
    content.setStyle('box-sizing', 'border-box', true)
    content.setStyle('max-width', 'inherit', true)
    content.setStyle('column-fill', 'auto', true)

    content.addStylesheetRule('img', {
      'max-width': '100%',
      'max-height': `${100 - 25 / 6}vh`,
      'object-fit': 'contain',
      'page-break-inside': 'avoid',
      'break-inside': 'avoid',
      'box-sizing': 'border-box'
    })

    content.addStylesheetRule('svg', {
      'max-width': '100%',
      'max-height': `${100 - 25 / 6}vh`,
      'page-break-inside': 'avoid',
      'break-inside': 'avoid'
    })

    this.updateViewLayout(view)
  }

  moveTo(range: Range) {
    const rect = range.getBoundingClientRect()
    const n = Math.floor(rect.left / this.viewData.pageWidth)
    const offset = (this.viewData.divisor > 1 && n % 2 === 1 ? n - 1 : n) * this.viewData.pageWidth
    this.stage.scrollTo(offset, 0)
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
      verticalPadding: Math.floor(this.stage.height / 48)
    }

    data.divisor = this.options.spread && data.width >= this.options.minSpreadWidth ? 2 : 1
    data.gap = this.options.gap || Math.floor(data.width / 24)
    if (data.gap % 2 !== 0) {
      data.gap -= 1
    }
    data.pageWidth = data.width / data.divisor
    data.columnWidth = data.pageWidth - data.gap
    data.horizontalPadding = Math.floor(data.gap / 2)

    this.viewData = data
  }

  updateStageLayout() {
    const view = this.views.get(0)

    this.updateViewData()

    this.updateViewLayout(view)

    this.stage.setSize(view.width, this.stage.height)

    if (this.location.range) {
      this.moveTo(this.location.range)
    }
  }

  updateViewLayout(view: View) {
    if (view.hidden || !view.content) {
      return
    }

    const content = view.content

    const { height, gap, columnWidth, pageWidth, horizontalPadding, verticalPadding } =
      this.viewData

    content.setStyle('width', `${pageWidth}px`, true)
    content.setStyle('height', `${height}px`, true)
    content.setStyle('min-width', `${pageWidth}px`, true)
    content.setStyle('min-height', `${height}px`, true)
    content.setStyle('padding-left', `${horizontalPadding}px`, true)
    content.setStyle('padding-right', `${horizontalPadding}px`, true)
    content.setStyle('padding-top', `${verticalPadding}px`, true)
    content.setStyle('padding-bottom', `${verticalPadding}px`, true)
    content.setStyle('column-gap', `${gap}px`, true)
    content.setStyle('column-width', `${columnWidth}px`, true)

    view.setSize(content.textWidth + gap, height)
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
