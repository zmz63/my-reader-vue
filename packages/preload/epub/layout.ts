import { Hook } from '@packages/common/hook'

export type LayoutOptions = {
  type: 'reflowable' | 'pre-paginated'
  spread: boolean
  minSpreadWidth: number
  gap: number
  flow: 'paginated' | 'scrolled-continuous' | 'scrolled-doc'
  axis: 'vertical' | 'horizontal'
  direction: 'ltr' | 'rtl'
}

export class Layout implements LayoutOptions {
  type: 'reflowable' | 'pre-paginated' = 'reflowable'

  width = 0

  height = 0

  spread = false

  minSpreadWidth = 800

  gap = 0

  flow: 'paginated' | 'scrolled-continuous' | 'scrolled-doc' = 'paginated'

  axis: 'vertical' | 'horizontal' = 'vertical'

  direction: 'ltr' | 'rtl' = 'ltr'

  wrapper: HTMLDivElement

  container: HTMLDivElement

  element: Element | null = null

  observer: ResizeObserver

  columnWidth = 0

  divisor = 0

  hooks = {
    update: new Hook()
  }

  constructor(options: Partial<LayoutOptions>) {
    Object.assign(this, options)
    this.wrapper = this.createWrapper()
    this.container = this.createContainer()
    this.observer = new ResizeObserver(() => {
      // TODO
    })
  }

  createWrapper() {
    if (this.wrapper) {
      return this.wrapper
    }

    const wrapper = document.createElement('div')

    wrapper.style.height = '100%'
    wrapper.style.width = '100%'
    wrapper.style.position = 'relative'
    wrapper.style.overflow = 'hidden'
    wrapper.style.display = 'flex'
    wrapper.style.justifyContent = 'center'
    wrapper.style.alignItems = 'center'

    return wrapper
  }

  createContainer() {
    if (this.container) {
      return this.container
    }

    const container = document.createElement('div')

    container.style.width = '0'
    container.style.height = '0'
    container.style.wordSpacing = '0'
    container.style.lineHeight = '0'
    container.style.verticalAlign = 'top'
    container.style.position = 'relative'
    container.style.overflow = 'hidden'

    if (this.axis === 'horizontal') {
      container.style.display = 'flex'
      container.style.flexDirection = 'row'
      container.style.flexWrap = 'nowrap'
    }

    if (this.direction) {
      container.dir = this.direction
      container.style.direction = this.direction
    }

    this.wrapper.appendChild(container)

    return container
  }

  attachTo(element: Element) {
    element.appendChild(this.wrapper)
    this.element = element

    return element
  }

  setLayout(type: 'reflowable'): void

  setLayout(type: 'pre-paginated', width: number, height: number): void

  setLayout(type: LayoutOptions['type'], width?: number, height?: number) {
    if (this.type === type) {
      return
    }

    this.type = type
    if (type === 'pre-paginated' && width && height) {
      this.setSize(width, height)
    } else {
      this.update()
    }
  }

  setSize(width: number, height: number) {
    if (this.width === width && this.height === height) {
      return
    }

    this.wrapper.style.minWidth = `${width}px`
    this.wrapper.style.minHeight = `${height}px`
    this.container.style.width = `${width}px`
    this.container.style.height = `${height}px`

    this.width = width
    this.height = height
    this.update()
  }

  setSpread(spread: boolean, minSpreadWidth: number) {
    if (this.spread === spread && this.minSpreadWidth === minSpreadWidth) {
      return
    }

    this.spread = spread
    this.minSpreadWidth = minSpreadWidth
    this.update()
  }

  setFlow(flow: LayoutOptions['flow']) {
    if (this.flow === flow) {
      return
    }

    this.flow = flow
    this.update()
  }

  setAxis(axis: LayoutOptions['axis']) {
    if (this.axis === axis) {
      return
    }

    if (axis === 'horizontal') {
      this.container.style.display = 'flex'
      this.container.style.flexDirection = 'row'
      this.container.style.flexWrap = 'nowrap'
    } else {
      this.container.style.display = 'block'
    }

    this.axis = axis
    this.update()
  }

  setDirection(direction: LayoutOptions['direction']) {
    if (this.direction === direction) {
      return
    }

    if (this.container) {
      this.container.dir = direction
      this.container.style.direction = direction
    }

    this.direction = direction
  }

  update() {
    const width = this.width || this.wrapper.clientWidth
    const height = this.height || this.wrapper.clientHeight

    if (this.type === 'pre-paginated') {
      //
    } else {
      const divisor = this.spread && width > this.minSpreadWidth ? 2 : 1
    }
  }

  destroy() {
    //
  }
}
