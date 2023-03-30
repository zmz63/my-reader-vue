import _path from 'path/posix'
import { Hook } from '@common/hook'
import { Queue } from '@common/queue'
import { type Book, CFI, type CFIPath, Content, Searcher, type Section } from '..'
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

export type LocationData = {
  cfi: string
  index: number
  href: string
}

export class PaginationRenderer {
  stage = new Stage()

  book: Book

  views: Views

  queue: Queue

  searcher: Searcher

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

  location: Location

  readonly hooks: Readonly<{
    location: Hook<(data: LocationData) => void>
    select: Hook<(view: View, section: Selection) => void>
    cancelSelect: Hook<(view: View, section: Selection) => void>
  }> = {
    location: new Hook(),
    select: new Hook(),
    cancelSelect: new Hook()
  }

  constructor(book: Book, options?: Partial<PaginationOptions>) {
    this.book = book
    this.views = new Views(this.stage.container)
    this.queue = new Queue(this)
    this.searcher = new Searcher(this.book.spine, this.views)
    this.location = new Proxy<Location>(
      { range: null, cfi: '' },
      {
        get: (target, property, receiver) => Reflect.get(target, property, receiver),
        set: (target, property, value, receiver) => {
          if (property === 'cfi') {
            const view = this.views.get(0)
            this.hooks.location.trigger({
              cfi: value,
              index: view.section.index,
              href: view.section.href
            })
          }

          return Reflect.set(target, property, value, receiver)
        }
      }
    )

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

  async display(target?: number | string, range?: Range) {
    await this.book.unpacked

    let section: Section | undefined
    let cfi = ''
    let path: CFIPath | null = null
    let id = ''
    if (typeof target === 'string') {
      if (CFI.isCFI(target)) {
        const result = CFI.parse(target)
        section = this.book.spine.get(result.base.sectionIndex)
        cfi = target
        path = result.path
      } else {
        const parts = target.split('#')
        section = this.book.spine.get(parts[0])
        id = parts[1]
      }
    } else {
      section = this.book.spine.get(target)
    }

    if (!section) {
      return
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

      return
    } else if (id) {
      const node = (view.content as Content).document.querySelector(`#${id}`)

      if (node) {
        const range = (view.content as Content).getNodeContentsRange(node)

        this.moveTo(range)
        this.location.range = range
        this.location.cfi = CFI.generate(view.section.cfiBase, range)

        return
      }
    } else if (range) {
      const contentRange = view.rangeToRange(range)

      if (contentRange) {
        this.moveTo(contentRange)
        this.location.range = contentRange
        this.location.cfi = CFI.generate(view.section.cfiBase, range)

        return
      }
    }

    this.stage.scrollTo(0, 0)
    this.updateLocation(view)
  }

  async prev() {
    let view = this.views.get(0)

    if (!view) {
      return
    }

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
    let view = this.views.get(0)

    if (!view) {
      return
    }

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

    view.hooks.anchorClick.register(href => {
      if (href.startsWith('book-cache:///')) {
        const path = _path.relative(this.book.cachePath, href.slice('book-cache:///'.length))

        this.display(path)
      }
    })
    view.hooks.select.register(selection => {
      if (selection.isCollapsed) {
        this.hooks.cancelSelect.trigger(view, selection)
      } else {
        this.hooks.select.trigger(view, selection)
      }
    })

    this.initViewContent(view)

    this.stage.setSize(view.width, this.stage.height)

    this.searcher.mark(view)

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

    range.collapse(false)

    this.location.range = range
    this.location.cfi = range ? CFI.generate(view.section.cfiBase, range) : ''

    console.log(this.location.cfi)
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

    content.addStylesheetRule('*::selection', {
      'background-color': 'pink'
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

    // NOTE
    view.setSize(0, height)

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
    this.views.clear()
    this.stage.destroy()
  }
}
