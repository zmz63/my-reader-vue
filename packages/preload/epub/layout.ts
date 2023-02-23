import { Hook } from '@packages/common/hook'

export type LayoutOptions = {
  layout: 'reflowable' | 'pre-paginated'
  width: number
  height: number
  spread: boolean
  minSpreadWidth: number
  gap: number
  flow: 'paginated' | 'scrolled-continuous' | 'scrolled-doc'
  axis: 'vertical' | 'horizontal'
  direction: 'ltr' | 'rtl'
}

export type LayoutData = {
  divisor: number
  gap: number
  columnWidth: number
}

export class Layout {
  options: LayoutOptions = {
    layout: 'reflowable',
    width: 0,
    height: 0,
    spread: false,
    minSpreadWidth: 800,
    gap: 0,
    flow: 'paginated',
    axis: 'horizontal',
    direction: 'ltr'
  }

  data: LayoutData = {
    divisor: 0,
    gap: 0,
    columnWidth: 0
  }

  wrapper: HTMLDivElement

  container: HTMLDivElement

  element: Element | null = null

  observer: ResizeObserver

  hooks = {
    update: new Hook<(options: LayoutOptions, data: LayoutData) => void>()
  }

  constructor(options: Partial<LayoutOptions>) {
    Object.assign(this.options, options)

    this.wrapper = this.createWrapper()
    this.container = this.createContainer()
    this.observer = new ResizeObserver(() => {
      if (!this.options.width || !this.options.height) {
        this.update()
      }
    })
    this.observer.observe(this.wrapper)
  }

  private createWrapper() {
    if (this.wrapper) {
      return this.wrapper
    }

    const wrapper = document.createElement('div')

    wrapper.style.height = '100%'
    wrapper.style.width = '100%'
    wrapper.style.minWidth = '0px'
    wrapper.style.minHeight = '0px'
    wrapper.style.position = 'relative'
    wrapper.style.overflow = 'hidden'
    wrapper.style.display = 'flex'
    wrapper.style.justifyContent = 'center'
    wrapper.style.alignItems = 'center'

    return wrapper
  }

  private createContainer() {
    if (this.container) {
      return this.container
    }

    const container = document.createElement('div')

    container.style.width = '0px'
    container.style.height = '0px'
    container.style.wordSpacing = '0'
    container.style.lineHeight = '0'
    container.style.verticalAlign = 'top'
    container.style.position = 'relative'
    container.style.overflow = 'hidden'

    if (this.options.axis === 'horizontal') {
      container.style.display = 'flex'
      container.style.flexDirection = 'row'
      container.style.flexWrap = 'nowrap'
    }

    if (this.options.direction) {
      container.dir = this.options.direction
      container.style.direction = this.options.direction
    }

    this.wrapper.appendChild(container)

    return container
  }

  attachTo(element: Element) {
    element.appendChild(this.wrapper)
    this.element = element

    return element
  }

  setLayout(layout: LayoutOptions['layout'], width: number, height: number) {
    this.options.layout = layout

    this.setSize(width, height)
  }

  setSize(width: number, height: number) {
    this.options.width = width
    this.options.height = height

    this.update()
  }

  setSpread(spread: boolean, minSpreadWidth = 800, gap = 0) {
    this.options.spread = spread
    this.options.minSpreadWidth = minSpreadWidth
    this.options.gap = gap

    this.update()
  }

  setFlow(flow: LayoutOptions['flow']) {
    this.options.flow = flow

    this.update()
  }

  setAxis(axis: LayoutOptions['axis']) {
    if (axis === 'horizontal') {
      this.container.style.display = 'flex'
      this.container.style.flexDirection = 'row'
      this.container.style.flexWrap = 'nowrap'
    } else {
      this.container.style.display = 'block'
    }

    this.options.axis = axis
  }

  setDirection(direction: LayoutOptions['direction']) {
    if (this.container) {
      this.container.dir = direction
      this.container.style.direction = direction
    }

    this.options.direction = direction
  }

  private update() {
    if (!this.element) {
      return
    }

    this.wrapper.style.minWidth = `${this.options.width}px`
    this.wrapper.style.minHeight = `${this.options.height}px`

    let width = this.options.width || this.wrapper.clientWidth
    const height = this.options.height || this.wrapper.clientHeight

    let divisor = 1
    let gap = 0
    let columnWidth = width

    if (this.options.flow === 'paginated' && this.options.spread) {
      if (this.options.layout === 'pre-paginated') {
        if (width * 2 <= this.wrapper.clientWidth) {
          width *= 2
          divisor = 2
        }
      } else {
        divisor = width >= this.options.minSpreadWidth ? 2 : 1
        gap = this.options.gap || Math.floor(width / 12)
        columnWidth = width / divisor - gap
      }
    }

    this.data.divisor = divisor
    this.data.gap = gap
    this.data.columnWidth = columnWidth

    this.container.style.width = `${width}px`
    this.container.style.height = `${height}px`

    this.hooks.update.trigger(this.options, this.data)
  }

  destroy() {
    // TODO
  }
}
