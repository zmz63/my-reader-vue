import type { Section } from './section'
import { Views } from './views'

export type ViewOptions = {
  width: number | string
  height: number | string
  layout: 'reflowable' | 'pre-paginated'
  flow: 'paginated' | 'scrolled-continuous' | 'scrolled-doc'
  axis: 'vertical' | 'horizontal'
  direction: 'ltr' | 'rtl'
}

export class ViewManager {
  options: ViewOptions = {
    width: '100%',
    height: '100%',
    layout: 'reflowable',
    flow: 'paginated',
    axis: 'vertical',
    direction: 'ltr'
  }

  container: HTMLDivElement

  views: Views

  element: Element | null = null

  constructor(options: Partial<ViewOptions> = {}) {
    Object.assign(this.options, options)
    this.container = this.createContainer(this.options)
    this.views = new Views(this.container)
  }

  createContainer(options: ViewOptions) {
    const container = document.createElement('div')

    container.style.wordSpacing = '0'
    container.style.lineHeight = '0'
    container.style.verticalAlign = 'top'
    container.style.position = 'relative'
    container.style.overflow = 'hidden'

    const width = typeof options.width === 'number' ? `${options.width}px` : options.width
    const height = typeof options.height === 'number' ? `${options.height}px` : options.height

    container.style.width = width
    container.style.height = height

    if (options.axis === 'horizontal') {
      container.style.display = 'flex'
      container.style.flexDirection = 'row'
      container.style.flexWrap = 'nowrap'
    }

    if (options.direction) {
      container.dir = options.direction
      container.style.direction = options.direction
    }

    return container
  }

  attachTo(element: Element) {
    element.appendChild(this.container)
    this.element = element

    return element
  }

  display(section: Section) {
    //
  }

  // getSize() {
  //   const rect = this.container.getBoundingClientRect()

  //   return {
  //     width: rect.width,
  //     height: rect.height
  //   }
  // }

  setSize(width: ViewOptions['width'], height: ViewOptions['height']) {
    this.container.style.width = typeof width === 'number' ? `${width}px` : width
    this.container.style.height = typeof height === 'number' ? `${height}px` : height
  }

  setAxis(axis: ViewOptions['axis']) {
    if (axis === 'horizontal') {
      this.container.style.display = 'flex'
      this.container.style.flexDirection = 'row'
      this.container.style.flexWrap = 'nowrap'
    } else {
      this.container.style.display = 'block'
    }

    this.options.axis = axis
  }

  setDirection(direction: ViewOptions['direction']) {
    if (this.container) {
      this.container.dir = direction
      this.container.style.direction = direction
    }

    this.options.direction = direction
  }
}
